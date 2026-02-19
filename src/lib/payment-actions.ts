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

function normalizeString(str: string): string {
    return str ? str.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
}

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

        // Fetch all active players for matching
        const dbPlayers = await (prisma.player as any).findMany({
            where: { status: 'ACTIVO' },
            select: { id: true, firstName: true, lastName: true, dni: true, partnerNumber: true, tira: true, category: true }
        });
        logs.push(`Jugadores activos en DB: ${dbPlayers.length}`);

        const results: PlayerMatchResult[] = [];
        let matchedCount = 0;

        for (const [index, row] of rawData.entries()) {
            const r = row as any;
            const rowNum = index + 2;
            const notes: string[] = [];

            // Extract Excel Data
            const dni = r['DNI']?.toString().trim();
            const socio = r['Nro. Socio']?.toString().trim();
            const apellido = normalizeString(r['Apellido']?.toString());
            const nombre = normalizeString(r['Nombre']?.toString());

            // Payment info
            const lastSocial = r['Ultoma\r\n cuota \r\nSocial \r\nAbonada']?.toString().trim();
            const lastActivity = r['Ultoma\r\n cuota \r\nActividad \r\nAbonada']?.toString().trim();

            let match: typeof dbPlayers[0] | undefined;
            let method: 'DNI' | 'PARTNER_NUMBER' | 'NAME_FUZZY' | undefined;

            // 1. Try DNI
            if (dni && dni.length > 4) {
                match = dbPlayers.find((p: any) => p.dni === dni);
                if (match) method = 'DNI';
            }

            // 2. Try Socio
            if (!match && socio) {
                match = dbPlayers.find((p: any) => p.partnerNumber === socio);
                if (match) method = 'PARTNER_NUMBER';
            }

            // 3. Try Name Fuzzy (Exact match of cleaned first + last)
            if (!match && nombre && apellido) {
                match = dbPlayers.find((p: any) =>
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
                notes.push(`No se pudo encontrar jugador: ${apellido}, ${nombre} (DNI: ${dni})`);
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
            stats: {
                total: rawData.length,
                matched: matchedCount,
                unmatched: rawData.length - matchedCount
            },
            results,
            logs
        };

    } catch (e: any) {
        logs.push(`ERROR CRÍTICO: ${e.message}`);
        return {
            success: false,
            message: e.message,
            stats: { total: 0, matched: 0, unmatched: 0 },
            results: [],
            logs
        };
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

            // Update player with last payment info
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
