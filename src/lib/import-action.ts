'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createAuditLog, validateShirtNumber } from "./actions";
import { evaluatePlayerStatus } from "./utils";
import * as XLSX from 'xlsx';

function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


export async function importData(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) {
        return { message: "No autorizado" };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { message: "No se seleccionó ningún archivo." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    let stats = { created: 0, updated: 0, unchanged: 0, errors: 0, conflicts: 0 };
    let importResults: any[] = [];

    try {
        const playersSheet = workbook.Sheets['Jugadores'];
        if (!playersSheet) {
            return { message: "Error: No se encontró la hoja 'Jugadores'." };
        }

        const playersData: any[] = XLSX.utils.sheet_to_json(playersSheet);
        let rowIdx = 2;
        // Track already-processed player IDs within this import to skip Excel duplicates
        const processedIds = new Set<string>();

        // Create Summary first
        const summary = await (prisma as any).importSummary.create({
            data: {
                id: generateId(),
                fileName: file.name,
                stats_created: 0,
                stats_updated: 0,
                stats_unchanged: 0,
                stats_errors: 0
            }
        });

        // Helper: normalize a value for comparison (null/""/undefined all treated as empty)
        const normalize = (val: any): string => {
            if (val === null || val === undefined || val === '') return '';
            if (val instanceof Date) return val.toISOString().slice(0, 10);
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            return String(val).trim();
        };

        const parseExcelDate = (val: any): Date | null => {
            if (!val) return null;
            const strVal = val.toString().trim();
            if (strVal === '00/00/0000' || strVal === '0/0/0' || strVal === '0') return null;
            if (typeof val === 'number') {
                return new Date(Math.round((val - 25569) * 86400 * 1000));
            }
            const d = new Date(val);
            if (!isNaN(d.getTime()) && d.getFullYear() > 1900) return d;
            return null;
        };

        for (const row of playersData) {
            const nombre = row['Nombre']?.toString().trim().toUpperCase();
            const apellido = row['Apellido']?.toString().trim().toUpperCase();
            const dniRaw = row['DNI']?.toString().trim() || '';
            const fechaNacimiento = row['FechaNacimiento'];

            if (!nombre || !apellido) {
                stats.errors++;
                await (prisma as any).importDetail.create({
                    data: {
                        id: generateId(),
                        summaryId: summary.id,
                        playerName: `Fila ${rowIdx}`,
                        action: 'ERROR',
                        details: 'Faltan campos básicos (Nombre/Apellido)'
                    }
                });
                rowIdx++;
                continue;
            }

            let isTempDni = false;
            let autoReview = false;
            let dni = dniRaw;

            // DNI handling: empty or "0" → generate TEMP
            if (!dni || dni === '0') {
                dni = `TEMP-${Date.now()}-${rowIdx}`;
                isTempDni = true;
                autoReview = true;
            }

            try {
                const birthDate = parseExcelDate(fechaNacimiento);
                if (!birthDate) autoReview = true;

                let status = 'ACTIVO';
                const excelStatus = row['Estado']?.toString().trim().toUpperCase();
                if (excelStatus === 'INACTIVO' || excelStatus === 'NO') status = 'INACTIVO';
                else if (excelStatus === 'REVISAR' || autoReview) status = 'REVISAR';
                else if (excelStatus === 'ACTIVO' || excelStatus === 'SI' || excelStatus === 'SÍ') status = 'ACTIVO';

                const tiraRaw = row['Tira']?.toString().trim() || 'Masculino A';
                let tira = 'Masculino A';
                if (tiraRaw.toLowerCase().includes('femenino')) tira = 'Femenino';
                else if (tiraRaw.toLowerCase().includes('mosquitos')) tira = 'Mosquitos';
                else if (tiraRaw.toLowerCase().includes('b')) tira = 'Masculino B';

                // All data from Excel (only non-empty values will be applied in updates)
                const excelData: any = {
                    firstName: nombre,
                    lastName: apellido,
                    dni,
                    birthDate: birthDate || new Date(0),
                    tira,
                    status: evaluatePlayerStatus(status, dni, birthDate),
                };
                // Optional fields: only include if Excel has a real value
                if (row['Beca']?.toString().trim()) excelData.scholarship = row['Beca'].toString().trim().toUpperCase() === 'SI';
                if (row['Primera']?.toString().trim()) excelData.playsPrimera = row['Primera'].toString().trim().toUpperCase() === 'SI';
                if (row['Email']?.toString().trim()) excelData.email = row['Email'].toString().trim().toLowerCase();
                if (row['Telefono']?.toString().trim()) excelData.phone = row['Telefono'].toString().trim();
                if (row['PersonaContacto']?.toString().trim()) excelData.contactName = row['PersonaContacto'].toString().trim().toUpperCase();
                if (row['NumeroSocio']?.toString().trim()) excelData.partnerNumber = row['NumeroSocio'].toString().trim();
                if (row['NumeroCamiseta']?.toString().trim()) {
                    excelData.shirtNumber = parseInt(row['NumeroCamiseta'].toString());
                }
                if (row['Observaciones']?.toString().trim()) excelData.observations = row['Observaciones'].toString().trim().toUpperCase();

                // ─────────────────────────────────────────────────────────────
                // STEP 1: Try to find by exact DNI (only meaningful DNIs)
                // ─────────────────────────────────────────────────────────────
                let existingPlayer: any = null;
                let foundByName = false;

                if (!isTempDni) {
                    existingPlayer = await prisma.player.findUnique({ where: { dni } });
                }

                // ─────────────────────────────────────────────────────────────
                // STEP 2: If not found by DNI, look by Name + Lastname
                // ─────────────────────────────────────────────────────────────
                if (!existingPlayer) {
                    const potentialMatch = await prisma.player.findFirst({
                        where: { firstName: nombre, lastName: apellido }
                    });

                    if (potentialMatch) {
                        foundByName = true;
                        const dbDni = potentialMatch.dni || '';
                        const dbIsTemp = dbDni.startsWith('TEMP-');

                        if (isTempDni || dbIsTemp) {
                            // Both sides don't have a real DNI, OR DB has temp and Excel has real → treat as same person, UPDATE
                            existingPlayer = potentialMatch;
                            // If Excel now has a real DNI, update it
                            if (!isTempDni) {
                                excelData.dni = dni; // upgrade from TEMP to real
                            } else {
                                // Keep the DB DNI (don't assign a new TEMP each import)
                                excelData.dni = dbDni;
                                dni = dbDni;
                            }
                        } else {
                            // Both have different real DNIs → CONFLICT
                            stats.conflicts = (stats.conflicts || 0) + 1;
                            await (prisma as any).importDetail.create({
                                data: {
                                    id: generateId(),
                                    summaryId: summary.id,
                                    playerName: `${apellido}, ${nombre}`,
                                    action: 'CONFLICT',
                                    details: `Mismo nombre pero distinto DNI (BD: ${potentialMatch.dni} / Excel: ${dniRaw})`,
                                    conflictEntityId: potentialMatch.id,
                                    conflictData: JSON.stringify({
                                        ...excelData,
                                        birthDate: birthDate?.toISOString() ?? null
                                    })
                                }
                            });
                            rowIdx++;
                            continue;
                        }
                    }
                }

                // ─────────────────────────────────────────────────────────────
                // STEP 3: Shirt Number Validation (Added for Build 4.5.8)
                // ─────────────────────────────────────────────────────────────
                if (excelData.shirtNumber !== undefined && excelData.shirtNumber !== null) {
                    const shirtError = await validateShirtNumber(
                        existingPlayer?.id || null,
                        excelData.shirtNumber,
                        tira,
                        birthDate?.toISOString() || "",
                        row['Categoría'] || row['Categoria'] || undefined
                    );
                    if (shirtError) {
                        throw new Error(shirtError);
                    }
                }

                // ─────────────────────────────────────────────────────────────
                // STEP 4: UPDATE or CREATE
                // ─────────────────────────────────────────────────────────────
                if (existingPlayer) {
                    // If this player was already processed in a previous row (Excel duplicate), skip
                    if (processedIds.has(existingPlayer.id)) {
                        stats.unchanged++;
                        await (prisma as any).importDetail.create({
                            data: {
                                id: generateId(),
                                summaryId: summary.id,
                                playerName: `${apellido}, ${nombre}`,
                                action: 'UNCHANGED',
                                details: 'Fila duplicada en el Excel (ya procesado)',
                                entityId: existingPlayer.id
                            }
                        });
                        rowIdx++;
                        continue;
                    }
                    processedIds.add(existingPlayer.id);

                    // Smart comparison: only count real differences
                    // Skip empty Excel values (don't overwrite DB data with nothing)
                    const changedFields: string[] = [];
                    const updatePayload: any = {};

                    for (const key of Object.keys(excelData)) {
                        const excelVal = excelData[key];
                        const dbVal = (existingPlayer as any)[key];

                        // Normalize for comparison
                        const excelNorm = excelVal instanceof Date
                            ? excelVal.toISOString().slice(0, 10)
                            : normalize(excelVal);
                        const dbNorm = dbVal instanceof Date
                            ? dbVal.toISOString().slice(0, 10)
                            : normalize(dbVal);

                        // Rule: if Excel value is empty, DON'T overwrite existing DB data
                        if (excelNorm === '' && dbNorm !== '') {
                            continue; // skip – keep DB value
                        }

                        if (excelNorm !== dbNorm) {
                            changedFields.push(key);
                            updatePayload[key] = excelVal;
                        }
                    }

                    if (changedFields.length > 0) {
                        // Protect registrationDate – never overwrite it from import
                        delete updatePayload.registrationDate;

                        await prisma.player.update({
                            where: { id: existingPlayer.id },
                            data: updatePayload
                        });

                        await createAuditLog('UPDATE', 'Player', existingPlayer.id, {
                            import: `Excel - Actualizados: ${changedFields.join(', ')}`
                        });
                        stats.updated++;
                        await (prisma as any).importDetail.create({
                            data: {
                                id: generateId(),
                                summaryId: summary.id,
                                playerName: `${apellido}, ${nombre}`,
                                action: 'UPDATE',
                                details: changedFields.join(', '),
                                entityId: existingPlayer.id
                            }
                        });
                    } else {
                        stats.unchanged++;
                        await (prisma as any).importDetail.create({
                            data: {
                                id: generateId(),
                                summaryId: summary.id,
                                playerName: `${apellido}, ${nombre}`,
                                action: 'UNCHANGED',
                                entityId: existingPlayer.id
                            }
                        });
                    }
                } else {
                    // CREATE: Add registrationDate only for new players
                    excelData.registrationDate = parseExcelDate(row['FechaAlta']) || new Date();
                    excelData.id = generateId();
                    excelData.updatedAt = new Date();
                    const newPlayer = await prisma.player.create({ data: excelData });
                    await createAuditLog('CREATE', 'Player', newPlayer.id, {
                        import: 'Excel - Jugador Nuevo'
                    });
                    stats.created++;
                    await (prisma as any).importDetail.create({
                        data: {
                            id: generateId(),
                            summaryId: summary.id,
                            playerName: `${apellido}, ${nombre}`,
                            action: 'CREATE',
                            entityId: newPlayer.id
                        }
                    });
                }
            } catch (e: any) {
                stats.errors++;
                await (prisma as any).importDetail.create({
                    data: {
                        id: generateId(),
                        summaryId: summary.id,
                        playerName: `${apellido || 'Error'}`,
                        action: 'ERROR',
                        details: e.message
                    }
                });
            }
            rowIdx++;
        }

        // Update Summary Stats
        await (prisma as any).importSummary.update({
            where: { id: summary.id },
            data: {
                stats_created: stats.created,
                stats_updated: stats.updated,
                stats_unchanged: stats.unchanged,
                stats_errors: stats.errors
            }
        });

    } catch (error: any) {
        return { message: "Error crítico: " + error.message };
    }

    revalidatePath('/dashboard/players');
    revalidatePath('/dashboard/administracion/import');
    revalidatePath('/dashboard/administracion/audit');

    return {
        message: stats.errors > 0 ? `Finalizado con ${stats.errors} errores.` : "Completado con éxito.",
        stats,
        success: true
    };
}

export async function resolveConflict(detailId: string, choice: 'keep_db' | 'use_excel') {
    const session = await auth();
    if (!session) throw new Error("No autorizado");

    const detail = await (prisma as any).importDetail.findUnique({ where: { id: detailId } });
    if (!detail || detail.action !== 'CONFLICT') throw new Error("Detalle no encontrado o no es un conflicto");

    if (choice === 'use_excel' && detail.conflictEntityId && detail.conflictData) {
        const excelData = JSON.parse(detail.conflictData);
        // Convert birthDate back to Date if present
        if (excelData.birthDate) excelData.birthDate = new Date(excelData.birthDate);
        // Don't overwrite registrationDate
        delete excelData.registrationDate;

        await prisma.player.update({
            where: { id: detail.conflictEntityId },
            data: {
                ...excelData,
                status: evaluatePlayerStatus(excelData.status, excelData.dni, excelData.birthDate)
            }
        });

        await createAuditLog('UPDATE', 'Player', detail.conflictEntityId, {
            resolution: `Conflicto de importación resuelto: datos del Excel aplicados al jugador existente`
        });
    } else if (choice === 'keep_db') {
        await createAuditLog('CONFLICT_RESOLVED', 'Player', detail.conflictEntityId || 'unknown', {
            resolution: 'Se mantuvieron los datos de la base de datos'
        });
    }

    // Mark conflict as resolved regardless of choice
    await (prisma as any).importDetail.update({
        where: { id: detailId },
        data: { resolved: true }
    });

    revalidatePath('/dashboard/administracion/import');
    revalidatePath('/dashboard/players');
}
