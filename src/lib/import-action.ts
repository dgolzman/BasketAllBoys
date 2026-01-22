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
        const playersSheet = workbook.Sheets['Jugadores'];
        if (!playersSheet) {
            return { message: "Error: No se encontró la hoja 'Jugadores' en el archivo Excel." };
        }

        const playersData: any[] = XLSX.utils.sheet_to_json(playersSheet);
        let rowIdx = 2;

        for (const row of playersData) {
            const nombre = row['Nombre']?.toString().trim().toUpperCase();
            const apellido = row['Apellido']?.toString().trim().toUpperCase();
            let dni = row['DNI']?.toString().trim() || '0';
            const fechaNacimiento = row['FechaNacimiento'];

            if (!nombre || !apellido) {
                const missing = [];
                if (!nombre) missing.push("Nombre");
                if (!apellido) missing.push("Apellido");
                stats.errors++;
                errorDetails.push(`Fila ${rowIdx}: Faltan campos básicos (${missing.join(', ')})`);
                rowIdx++;
                continue;
            }

            let autoReview = false;

            // DNI Placeholder handling
            if (dni === '0' || !dni) {
                dni = `TEMP-${Date.now()}-${rowIdx}`;
                autoReview = true;
            }

            try {
                const parseExcelDate = (val: any) => {
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

                const birthDate = parseExcelDate(fechaNacimiento);
                if (!birthDate) autoReview = true;

                // Status Logic
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

                const email = row['Email']?.toString().trim().toLowerCase() || null;
                const phone = row['Telefono']?.toString().trim() || null;
                const contactName = row['PersonaContacto']?.toString().trim().toUpperCase() || null;
                const partnerNumber = row['NumeroSocio']?.toString().trim() || null;
                const shirtNumber = row['NumeroCamiseta'] ? parseInt(row['NumeroCamiseta'].toString()) : null;
                const registrationDate = parseExcelDate(row['FechaAlta']) || new Date();
                const observations = row['Observaciones']?.toString().trim().toUpperCase() || null;

                const scholarship = row['Beca']?.toString().trim().toUpperCase() === 'SI';
                const playsPrimera = row['Primera']?.toString().trim().toUpperCase() === 'SI';

                await (prisma.player as any).upsert({
                    where: { dni },
                    update: {
                        firstName: nombre, lastName: apellido, birthDate: birthDate || new Date(0),
                        tira, status, scholarship, playsPrimera, email, phone,
                        contactName, partnerNumber, shirtNumber, registrationDate, observations
                    },
                    create: {
                        dni, firstName: nombre, lastName: apellido, birthDate: birthDate || new Date(0),
                        tira, status, scholarship, playsPrimera, email, phone,
                        contactName, partnerNumber, shirtNumber, registrationDate, observations
                    }
                });

                stats.players++;
            } catch (e: any) {
                stats.errors++;
                errorDetails.push(`Fila ${rowIdx} (${apellido}): ${e.message}`);
            }
            rowIdx++;
        }

        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: 'IMPORT', entity: 'Player', entityId: 'BATCH',
                    details: JSON.stringify({ stats, errorCount: stats.errors }),
                    userId: session.user.id
                }
            });
        }
    } catch (error: any) {
        return { message: "Error crítico: " + error.message };
    }

    revalidatePath('/dashboard/players');
    return { message: stats.errors > 0 ? `Importación con ${stats.errors} errores.` : "Éxito.", stats, errorDetails };
}
