'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "./actions";
import * as XLSX from 'xlsx';

export type PaymentStatus = {
    social: string;
    activity: string;
    socialDate?: string;
    activityDate?: string;
};

export type PlayerMatchResult = {
    originalData: any;
    status: 'MATCHED' | 'UNMATCHED';
    matchMethod?: 'DNI' | 'PARTNER_NUMBER' | 'NAME_FUZZY';
    player?: {
        id: string;
        name: string;
        dni: string;
        category: string;
        tira: string;
    };
    paymentStatus?: PaymentStatus;
    notes?: string[];
};

export type ImportResult = {
    success: boolean;
    message?: string;
    stats: {
        total: number;
        matched: number;
        unmatched: number;
    };
    results: PlayerMatchResult[];
    logs: string[];
};

export type FederationPaymentData = {
    year: number;
    installments: string;
};

export type FederationMatchResult = {
    originalData: any;
    status: 'MATCHED' | 'UNMATCHED';
    matchMethod?: 'DNI' | 'NAME_FUZZY';
    player?: {
        id: string;
        name: string;
        dni: string;
        category: string;
        tira: string;
        playerStatus: string;
    };
    federationData?: FederationPaymentData;
    notes?: string[];
};

export type FederationImportResult = {
    success: boolean;
    message?: string;
    stats: {
        total: number;
        matched: number;
        unmatched: number;
    };
    results: FederationMatchResult[];
    logs: string[];
};

function normalizeString(str: string): string {
    return str ? str.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
}

/**
 * Finds a column key in a row using flexible matching:
 * - Exact match (case-insensitive, normalized whitespace)
 * - Partial match (key contains the candidate)
 */
function findColumn(row: any, candidates: string[]): string | undefined {
    const rowKeys = Object.keys(row);
    // Pass 1: exact match after normalizing whitespace
    for (const candidate of candidates) {
        const nc = candidate.trim().toLowerCase().replace(/\s+/g, ' ');
        const found = rowKeys.find(k => k.trim().toLowerCase().replace(/[\r\n\s]+/g, ' ') === nc);
        if (found) return found;
    }
    // Pass 2: partial includes
    for (const candidate of candidates) {
        const nc = candidate.trim().toLowerCase();
        const found = rowKeys.find(k => k.toLowerCase().replace(/[\r\n]+/g, ' ').trim().includes(nc));
        if (found) return found;
    }
    return undefined;
}

// ─── CUOTA SOCIAL / ACTIVIDAD ────────────────────────────────────────────────

export async function processPaymentExcel(prevState: any, formData: FormData): Promise<ImportResult> {
    const session = await auth();
    if (!session) {
        return { success: false, message: "No autorizado", stats: { total: 0, matched: 0, unmatched: 0 }, results: [], logs: ["Error: Usuario no autenticado"] };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, message: "No se seleccionó archivo", stats: { total: 0, matched: 0, unmatched: 0 }, results: [], logs: ["Error: Sin archivo"] };
    }

    const logs: string[] = [];
    logs.push(`Inicio de procesamiento: ${new Date().toLocaleString()}`);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('basquet')) || workbook.SheetNames[0];
        logs.push(`Leyendo hoja: ${sheetName}`);

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        logs.push(`Filas encontradas: ${rawData.length}`);

        if (rawData.length > 0) {
            logs.push(`Columnas detectadas: ${Object.keys(rawData[0] as any).join(' | ')}`);
        }

        // Fetch ALL players to check for inactive ones too
        const dbPlayers = await (prisma.player as any).findMany({
            select: { id: true, firstName: true, lastName: true, dni: true, partnerNumber: true, tira: true, category: true, status: true }
        });
        const activePlayers = dbPlayers.filter((p: any) => p.status === 'ACTIVO' || p.status === 'REVISAR');
        logs.push(`Jugadores (ACTIVO + REVISAR) en DB: ${activePlayers.length} (Total con inactivos: ${dbPlayers.length})`);

        const results: PlayerMatchResult[] = [];
        let matchedCount = 0;

        for (const [index, row] of rawData.entries()) {
            const r = row as any;
            const rowNum = index + 2;
            const notes: string[] = [];

            // Flexible column detection - handles: documento, DNI
            const dniKey = findColumn(r, ['documento', 'dni']);
            // nrosocio (sin espacio), nro. socio, nro socio
            const socioKey = findColumn(r, ['nrosocio', 'nro. socio', 'nro socio', 'socio']);
            const apellidoKey = findColumn(r, ['apellido']);
            const nombreKey = findColumn(r, ['nombre']);
            // "Ultima cuota social abonada" / "Ultoma cuota Social Abonada"
            const socialKey = findColumn(r, ['ultima cuota social abonada', 'ultima cuota social', 'cuota social']);
            const activityKey = findColumn(r, ['ultima cuota actividad abonada', 'ultima cuota actividad', 'cuota actividad']);

            const dni = dniKey ? r[dniKey]?.toString().trim() : undefined;
            const socio = socioKey ? r[socioKey]?.toString().trim() : undefined;
            const apellido = apellidoKey ? normalizeString(r[apellidoKey]?.toString()) : '';
            const nombre = nombreKey ? normalizeString(r[nombreKey]?.toString()) : '';
            const lastSocial = socialKey ? r[socialKey]?.toString().trim() : undefined;
            const lastActivity = activityKey ? r[activityKey]?.toString().trim() : undefined;

            let match: typeof dbPlayers[0] | undefined;
            let method: 'DNI' | 'PARTNER_NUMBER' | 'NAME_FUZZY' | undefined;

            // 1. Try DNI / Documento
            if (dni && dni.length > 4) {
                match = activePlayers.find((p: any) => p.dni === dni);
                if (match) method = 'DNI';
            }

            // 2. Try Nro. Socio
            if (!match && socio) {
                match = activePlayers.find((p: any) => p.partnerNumber === socio);
                if (match) method = 'PARTNER_NUMBER';
            }

            // 3. Try Name Fuzzy (exact clean match)
            if (!match && nombre && apellido) {
                match = activePlayers.find((p: any) =>
                    normalizeString(p.firstName) === nombre &&
                    normalizeString(p.lastName) === apellido
                );
                if (match) method = 'NAME_FUZZY';
            }

            const paymentStatus: PaymentStatus = {
                social: lastSocial || '-',
                activity: lastActivity || '-',
                socialDate: lastSocial,
                activityDate: lastActivity
            };

            if (match) {
                matchedCount++;
                logs.push(`Fila ${rowNum}: Encontrado ${match.firstName} ${match.lastName} por ${method}`);
                results.push({
                    status: 'MATCHED',
                    matchMethod: method,
                    originalData: row,
                    player: {
                        id: match.id,
                        name: `${match.lastName}, ${match.firstName}`,
                        dni: match.dni,
                        category: match.category || 'N/A',
                        tira: match.tira
                    },
                    paymentStatus,
                    notes
                });
            } else {
                // Secondary check: is it an INACTIVE player?
                let inactiveMatch: any = null;
                if (dni && dni.length > 4) inactiveMatch = dbPlayers.find((p: any) => p.dni === dni && p.status === 'INACTIVO');
                if (!inactiveMatch && socio) inactiveMatch = dbPlayers.find((p: any) => p.partnerNumber === socio && p.status === 'INACTIVO');
                if (!inactiveMatch && nombre && apellido) {
                    inactiveMatch = dbPlayers.find((p: any) =>
                        normalizeString(p.firstName) === nombre &&
                        normalizeString(p.lastName) === apellido &&
                        p.status === 'INACTIVO'
                    );
                }

                if (inactiveMatch) {
                    notes.push(`⚠️ Jugador encontrado pero está INACTIVO (Dada de baja): ${inactiveMatch.lastName}, ${inactiveMatch.firstName}`);
                } else {
                    notes.push(`No se pudo encontrar jugador: ${apellido}, ${nombre} (DNI: ${dni})`);
                }

                results.push({
                    status: 'UNMATCHED',
                    originalData: row,
                    paymentStatus,
                    notes
                });
            }
        }

        logs.push(`Proceso de ANÁLISIS finalizado. Coincidencias: ${matchedCount}/${rawData.length}`);
        logs.push(`NOTA: No se han guardado cambios en la base de datos. Revise y confirme.`);

        return {
            success: true,
            stats: { total: rawData.length, matched: matchedCount, unmatched: rawData.length - matchedCount },
            results,
            logs
        };

    } catch (e: any) {
        logs.push(`ERROR CRÍTICO: ${e.message}`);
        return { success: false, message: e.message, stats: { total: 0, matched: 0, unmatched: 0 }, results: [], logs };
    }
}

export async function savePaymentUpdates(prevState: any, dataset: PlayerMatchResult[]) {
    const session = await auth();
    if (!session) return { success: false, message: "No autorizado" };

    const updates = dataset.filter(d => d.status === 'MATCHED' && d.player?.id);
    let count = 0;

    try {
        for (const item of updates) {
            if (!item.player?.id) continue;
            await (prisma.player as any).update({
                where: { id: item.player.id },
                data: {
                    lastSocialPayment: item.paymentStatus?.social,
                    lastActivityPayment: item.paymentStatus?.activity
                }
            });
            count++;
        }
        await createAuditLog('IMPORT_PAYMENTS', 'Player', 'BATCH', { count, total: updates.length });
        return { success: true, message: `Se actualizaron los pagos de ${count} jugadores correctamente.` };
    } catch (error: any) {
        return { success: false, message: "Error al guardar: " + error.message };
    }
}

// ─── SEGURO / FEDERACIÓN ─────────────────────────────────────────────────────

export async function processFederationPaymentExcel(prevState: any, formData: FormData): Promise<FederationImportResult> {
    const session = await auth();
    if (!session) {
        return { success: false, message: "No autorizado", stats: { total: 0, matched: 0, unmatched: 0 }, results: [], logs: ["Error: Usuario no autenticado"] };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, message: "No se seleccionó archivo", stats: { total: 0, matched: 0, unmatched: 0 }, results: [], logs: ["Error: Sin archivo"] };
    }

    const logs: string[] = [];
    logs.push(`Inicio de procesamiento: ${new Date().toLocaleString()}`);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        logs.push(`Leyendo hoja: ${sheetName}`);

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        logs.push(`Filas encontradas: ${rawData.length}`);

        if (rawData.length > 0) {
            logs.push(`Columnas detectadas: ${Object.keys(rawData[0] as any).join(' | ')}`);
        }

        // Fetch ALL players
        const dbPlayers = await (prisma.player as any).findMany({
            select: { id: true, firstName: true, lastName: true, dni: true, tira: true, category: true, status: true }
        });
        const activePlayers = dbPlayers.filter((p: any) => p.status === 'ACTIVO' || p.status === 'REVISAR');
        logs.push(`Jugadores (ACTIVO + REVISAR) en DB: ${activePlayers.length} (Total con inactivos: ${dbPlayers.length})`);

        const results: FederationMatchResult[] = [];
        let matchedCount = 0;

        for (const [index, row] of rawData.entries()) {
            const r = row as any;
            const rowNum = index + 2;
            const notes: string[] = [];

            const dniKey = findColumn(r, ['dni', 'documento']);
            const apellidoKey = findColumn(r, ['apellido']);
            const nombreKey = findColumn(r, ['nombre']);
            const yearKey = findColumn(r, ['año', 'anio', 'year', 'año pago', 'año del pago']);
            const cuotasKey = findColumn(r, ['cuotas', 'cuotas abonadas', 'cuotas pagadas', 'installments', 'estado']);

            const dni = dniKey ? r[dniKey]?.toString().trim() : undefined;
            const apellido = apellidoKey ? normalizeString(r[apellidoKey]?.toString()) : '';
            const nombre = nombreKey ? normalizeString(r[nombreKey]?.toString()) : '';
            const yearRaw = yearKey ? r[yearKey]?.toString().trim() : undefined;
            const cuotasRaw = cuotasKey ? r[cuotasKey]?.toString().trim().toUpperCase() : undefined;

            const year = yearRaw ? parseInt(yearRaw) : NaN;
            const installments = cuotasRaw || '';

            let match: typeof dbPlayers[0] | undefined;
            let method: 'DNI' | 'NAME_FUZZY' | undefined;

            if (dni && dni.length > 4) {
                match = activePlayers.find((p: any) => p.dni === dni);
                if (match) method = 'DNI';
            }

            if (!match && nombre && apellido) {
                match = activePlayers.find((p: any) =>
                    normalizeString(p.firstName) === nombre &&
                    normalizeString(p.lastName) === apellido
                );
                if (match) method = 'NAME_FUZZY';
            }

            const federationData: FederationPaymentData | undefined =
                (!isNaN(year) && installments) ? { year, installments } : undefined;

            if (!federationData) {
                notes.push(`Fila ${rowNum}: Año o cuotas inválidos o faltantes.`);
            }

            if (match) {
                matchedCount++;
                logs.push(`Fila ${rowNum}: Encontrado ${match.firstName} ${match.lastName} (${match.status}) por ${method}`);
                results.push({
                    status: 'MATCHED',
                    matchMethod: method,
                    originalData: row,
                    player: {
                        id: match.id,
                        name: `${match.lastName}, ${match.firstName}`,
                        dni: match.dni,
                        category: match.category || 'N/A',
                        tira: match.tira,
                        playerStatus: match.status
                    },
                    federationData,
                    notes
                });
            } else {
                // Secondary check: is it an INACTIVE player?
                let inactiveMatch: any = null;
                if (dni && dni.length > 4) inactiveMatch = dbPlayers.find((p: any) => p.dni === dni && p.status === 'INACTIVO');
                if (!inactiveMatch && nombre && apellido) {
                    inactiveMatch = dbPlayers.find((p: any) =>
                        normalizeString(p.firstName) === nombre &&
                        normalizeString(p.lastName) === apellido &&
                        p.status === 'INACTIVO'
                    );
                }

                if (inactiveMatch) {
                    notes.push(`⚠️ Jugador encontrado pero está INACTIVO (Dada de baja): ${inactiveMatch.lastName}, ${inactiveMatch.firstName}`);
                } else {
                    notes.push(`No se pudo encontrar jugador: ${apellido}, ${nombre} (DNI: ${dni})`);
                }

                results.push({ status: 'UNMATCHED', originalData: row, federationData, notes });
            }
        }

        logs.push(`Proceso de ANÁLISIS finalizado. Coincidencias: ${matchedCount}/${rawData.length}`);
        logs.push(`NOTA: No se han guardado cambios en la base de datos. Revise y confirme.`);

        return {
            success: true,
            stats: { total: rawData.length, matched: matchedCount, unmatched: rawData.length - matchedCount },
            results,
            logs
        };

    } catch (e: any) {
        logs.push(`ERROR CRÍTICO: ${e.message}`);
        return { success: false, message: e.message, stats: { total: 0, matched: 0, unmatched: 0 }, results: [], logs };
    }
}

export async function saveFederationPaymentUpdates(prevState: any, dataset: FederationMatchResult[]) {
    const session = await auth();
    if (!session) return { success: false, message: "No autorizado" };

    const updates = dataset.filter(d => d.status === 'MATCHED' && d.player?.id && d.federationData);
    let count = 0;

    try {
        for (const item of updates) {
            if (!item.player?.id || !item.federationData) continue;
            await (prisma.player as any).update({
                where: { id: item.player.id },
                data: {
                    federationYear: item.federationData.year,
                    federationInstallments: item.federationData.installments
                }
            });
            count++;
        }
        await createAuditLog('IMPORT_FEDERATION_PAYMENTS', 'Player', 'BATCH', { count, total: updates.length });
        return { success: true, message: `Se actualizó el pago de federación/seguro de ${count} jugadores correctamente.` };
    } catch (error: any) {
        return { success: false, message: "Error al guardar: " + error.message };
    }
}
