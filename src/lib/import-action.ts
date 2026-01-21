'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import * as XLSX from 'xlsx';

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

    let stats = { players: 0, errors: 0 };
    let errorDetails: string[] = [];

    try {
        // Process Jugadores sheet
        const playersSheet = workbook.Sheets['Jugadores'];
        if (!playersSheet) {
            return { message: "Error: No se encontró la hoja 'Jugadores' en el archivo Excel." };
        }

        const playersData: any[] = XLSX.utils.sheet_to_json(playersSheet);
        let rowIdx = 2; // Excel row number (starting after header)

        for (const row of playersData) {
            // Required fields validation
            const nombre = row['Nombre']?.toString().trim().toUpperCase();
            const apellido = row['Apellido']?.toString().trim().toUpperCase();
            const dni = row['DNI']?.toString().trim();
            const fechaNacimiento = row['FechaNacimiento'];

            if (!nombre || !apellido || !dni || !fechaNacimiento) {
                const missing = [];
                if (!nombre) missing.push("Nombre");
                if (!apellido) missing.push("Apellido");
                if (!dni) missing.push("DNI");
                if (!fechaNacimiento) missing.push("FechaNacimiento");

                const errorMsg = `Fila ${rowIdx}: Faltan campos obligatorios (${missing.join(', ')})`;
                errorDetails.push(errorMsg);
                stats.errors++;

                // Log failed import
                if (session?.user?.id) {
                    await prisma.auditLog.create({
                        data: {
                            action: 'FAILED_IMPORT',
                            entity: 'Player',
                            entityId: dni || 'UNKNOWN',
                            details: JSON.stringify({ rowIdx, error: errorMsg }),
                            userId: session.user.id
                        }
                    });
                }

                rowIdx++;
                continue;
            }

            try {
                // Parse Excel date (handles both Excel serial numbers and date strings)
                const parseExcelDate = (val: any) => {
                    if (!val) return null;
                    if (typeof val === 'number') {
                        // Excel serial date
                        return new Date(Math.round((val - 25569) * 86400 * 1000));
                    }
                    const d = new Date(val);
                    if (!isNaN(d.getTime())) return d;
                    return null;
                };

                const birthDate = parseExcelDate(fechaNacimiento);
                if (!birthDate) {
                    throw new Error("Fecha de nacimiento inválida");
                }

                // Optional fields
                const tiraRaw = row['Tira']?.toString().trim() || 'Masculino A';
                let tira = 'Masculino A';
                if (tiraRaw.toLowerCase().includes('femenino')) tira = 'Femenino';
                else if (tiraRaw.toLowerCase().includes('mosquitos')) tira = 'Mosquitos';
                else if (tiraRaw.toLowerCase().includes('b')) tira = 'Masculino B';
                else if (tiraRaw.toLowerCase().includes('a')) tira = 'Masculino A';

                const email = row['Email']?.toString().trim().toLowerCase() || null;
                const telefono = row['Telefono']?.toString().trim() || null;
                const personaContacto = row['PersonaContacto']?.toString().trim().toUpperCase() || null;
                const numeroSocio = row['NumeroSocio']?.toString().trim() || null;
                const numeroCamiseta = row['NumeroCamiseta'] ? parseInt(row['NumeroCamiseta'].toString()) : null;
                const fechaAlta = parseExcelDate(row['FechaAlta']) || new Date();
                const observaciones = row['Observaciones']?.toString().trim().toUpperCase() || null;

                // Boolean fields
                const becaRaw = row['Beca']?.toString().trim().toUpperCase();
                const scholarship = becaRaw === 'SI' || becaRaw === 'SÍ' || becaRaw === 'S';

                const primeraRaw = row['Primera']?.toString().trim().toUpperCase();
                const playsPrimera = primeraRaw === 'SI' || primeraRaw === 'SÍ' || primeraRaw === 'S';

                const activoRaw = row['Activo']?.toString().trim().toUpperCase();
                const active = activoRaw === 'NO' || activoRaw === 'N' ? false : true; // Default to true

                // Upsert player
                await prisma.player.upsert({
                    where: { dni },
                    update: {
                        firstName: nombre,
                        lastName: apellido,
                        birthDate,
                        tira,
                        email,
                        phone: telefono,
                        contactName: personaContacto,
                        partnerNumber: numeroSocio,
                        shirtNumber: numeroCamiseta,
                        registrationDate: fechaAlta,
                        observations: observaciones,
                        scholarship,
                        playsPrimera,
                        active
                    },
                    create: {
                        dni,
                        firstName: nombre,
                        lastName: apellido,
                        birthDate,
                        tira,
                        email,
                        phone: telefono,
                        contactName: personaContacto,
                        partnerNumber: numeroSocio,
                        shirtNumber: numeroCamiseta,
                        registrationDate: fechaAlta,
                        observations: observaciones,
                        scholarship,
                        playsPrimera,
                        active
                    }
                });

                stats.players++;
            } catch (e: any) {
                console.error(e);
                stats.errors++;
                errorDetails.push(`Fila ${rowIdx} (${apellido}, ${nombre}): ${e.message}`);
            }

            rowIdx++;
        }

        // Audit log for successful import
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: 'IMPORT',
                    entity: 'Player',
                    entityId: 'BATCH',
                    details: JSON.stringify({ stats, errorCount: stats.errors }),
                    userId: session.user.id
                }
            });
        }

    } catch (error: any) {
        console.error(error);
        return { message: "Error crítico: " + error.message };
    }

    revalidatePath('/dashboard/players');

    if (stats.errors > 0) {
        return {
            message: `Importación completada con ${stats.errors} error(es).`,
            stats,
            errorDetails: errorDetails.slice(0, 20) // Limit to first 20 errors
        };
    }

    return { message: "Importación completada con éxito.", stats };
}
