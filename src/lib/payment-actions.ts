'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "./actions";
import * as XLSX from 'xlsx';
import { revalidatePath } from "next/cache";

export type PaymentStatus = {
    social: string;
    activity: string;
    socialDate?: string;
    activityDate?: string;
    currentSocial?: string;
    currentActivity?: string;
    isNewSocial?: boolean;
    isNewActivity?: boolean;
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
    hasChanges?: boolean;
    notes?: string[];
};

export type ImportResult = {
    success: boolean;
    message?: string;
    stats: {
        total: number;
        matched: number;
        unmatched: number;
        newPayments: number;
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

function findColumn(row: any, candidates: string[]): string | undefined {
    const rowKeys = Object.keys(row);
    for (const candidate of candidates) {
        const nc = candidate.trim().toLowerCase().replace(/\s+/g, ' ');
        const found = rowKeys.find(k => k.trim().toLowerCase().replace(/[\r\n\s]+/g, ' ') === nc);
        if (found) return found;
    }
    for (const candidate of candidates) {
        const nc = candidate.trim().toLowerCase();
        const found = rowKeys.find(k => k.toLowerCase().replace(/[\r\n]+/g, ' ').trim().includes(nc));
        if (found) return found;
    }
    return undefined;
}

export async function processPaymentExcel(prevState: any, formData: FormData): Promise<ImportResult> {
    const session = await auth();
    if (!session) {
        return { success: false, message: "No autorizado", stats: { total: 0, matched: 0, unmatched: 0, newPayments: 0 }, results: [], logs: ["Error: Usuario no autenticado"] };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, message: "No se seleccionó archivo", stats: { total: 0, matched: 0, unmatched: 0, newPayments: 0 }, results: [], logs: ["Error: Sin archivo"] };
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

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        const headerRowIndex = rows.findIndex(row =>
            row.some(cell => {
                const s = normalizeString(String(cell || ''));
                return s.includes('DNI') || s.includes('DOCUMENTO') || s.includes('APELLIDO') || s.includes('SOCIO');
            })
        );

        const rawData = headerRowIndex !== -1
            ? XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex })
            : XLSX.utils.sheet_to_json(sheet);

        logs.push(`Filas de datos encontradas: ${rawData.length}`);

        const dbPlayers = await (prisma.player as any).findMany({
            select: { id: true, firstName: true, lastName: true, dni: true, partnerNumber: true, tira: true, category: true, status: true, lastSocialPayment: true, lastActivityPayment: true }
        });
        const activePlayers = dbPlayers.filter((p: any) => p.status === 'ACTIVO' || p.status === 'REVISAR');

        const results: PlayerMatchResult[] = [];
        let matchedCount = 0;
        let newPaymentsCount = 0;

        for (const [index, row] of rawData.entries()) {
            const r = row as any;
            const notes: string[] = [];

            const dniKey = findColumn(r, ['documento', 'dni', 'dni_nro', 'documento_nro', 'numero documento']);
            const socioKey = findColumn(r, ['nrosocio', 'nro. socio', 'nro socio', 'socio', 'nro_socio']);
            const apellidoKey = findColumn(r, ['apellido', 'apellidos']);
            const nombreKey = findColumn(r, ['nombre', 'nombres', 'cliente', 'nombre y apellido', 'nombre completo', 'apellido / nombre', 'apellido y nombre']);

            const matchedSocialKey = findColumn(r, ['ultima cuota social abonada', 'ultima cuota social', 'cuota social']);
            const socialKey = matchedSocialKey || findColumn(r, ['social']);
            const matchedActivityKey = findColumn(r, ['ultima cuota actividad abonada', 'ultima cuota actividad', 'cuota actividad']);
            const activityKey = matchedActivityKey || findColumn(r, ['actividad']);

            const dniVal = dniKey ? r[dniKey]?.toString().trim() : undefined;
            const dniClean = (dniVal && /\d+/.test(dniVal)) ? dniVal.replace(/\D/g, '') : undefined;
            const socio = socioKey ? r[socioKey]?.toString().trim() : undefined;

            let apellido = apellidoKey ? normalizeString(r[apellidoKey]?.toString()) : '';
            let nombre = nombreKey ? normalizeString(r[nombreKey]?.toString()) : '';

            if (nombre && !apellido) {
                if (nombre.includes('/') || nombre.includes(',') || nombre.includes('-')) {
                    const separator = nombre.includes('/') ? '/' : (nombre.includes(',') ? ',' : '-');
                    const parts = nombre.split(separator);
                    apellido = normalizeString(parts[0]);
                    nombre = normalizeString(parts[1]);
                }
            }

            const lastSocial = socialKey ? r[socialKey]?.toString().trim() : undefined;
            const lastActivity = activityKey ? r[activityKey]?.toString().trim() : undefined;

            let match: any;
            let method: 'DNI' | 'PARTNER_NUMBER' | 'NAME_FUZZY' | undefined;

            if (dniClean && dniClean.length > 4) {
                match = activePlayers.find((p: any) => p.dni === dniClean);
                if (match) method = 'DNI';
            }
            if (!match && socio) {
                match = activePlayers.find((p: any) => p.partnerNumber === socio);
                if (match) method = 'PARTNER_NUMBER';
            }
            if (!match && nombre) {
                const fullSearch = normalizeString(nombre + (apellido ? ' ' + apellido : ''));
                const searchParts = fullSearch.split(' ').filter(p => p.length > 2);
                match = activePlayers.find((p: any) => {
                    const dbFull = normalizeString(`${p.firstName} ${p.lastName}`);
                    const dbFullRev = normalizeString(`${p.lastName} ${p.firstName}`);
                    if (dbFull === fullSearch || dbFullRev === fullSearch) return true;
                    if (searchParts.length >= 2) return searchParts.every(part => dbFull.includes(part));
                    return false;
                });
                if (match) method = 'NAME_FUZZY';
            }

            const isEmptyInput = (v: any) => !v || v === '-' || v === '0' || v === 'S/D' || v.toString().trim() === '' || v.toString().trim() === '0';
            const normalizePayment = (v: any) => v ? v.toString().replace(/\D/g, '') : '';

            const isNewSocial = match && !isEmptyInput(lastSocial) && normalizePayment(lastSocial) !== normalizePayment(match.lastSocialPayment);
            const isNewActivity = match && !isEmptyInput(lastActivity) && normalizePayment(lastActivity) !== normalizePayment(match.lastActivityPayment);

            const paymentStatus: PaymentStatus = {
                social: lastSocial || '-',
                activity: lastActivity || '-',
                socialDate: lastSocial,
                activityDate: lastActivity,
                currentSocial: match?.lastSocialPayment || '-',
                currentActivity: match?.lastActivityPayment || '-',
                isNewSocial,
                isNewActivity
            };

            if (match) {
                matchedCount++;
                const hasChanges = isNewSocial || isNewActivity;
                if (hasChanges) newPaymentsCount++;
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
                    hasChanges,
                    notes
                });
            } else {
                results.push({ status: 'UNMATCHED', originalData: row, paymentStatus, notes: ["No se pudo encontrar jugador"] });
            }
        }

        return {
            success: true,
            stats: { total: rawData.length, matched: matchedCount, unmatched: rawData.length - matchedCount, newPayments: newPaymentsCount },
            results,
            logs
        };
    } catch (e: any) {
        return { success: false, message: e.message, stats: { total: 0, matched: 0, unmatched: 0, newPayments: 0 }, results: [], logs: [e.message] };
    }
}

export async function savePaymentUpdates(prevState: any, dataset: PlayerMatchResult[]) {
    const session = await auth();
    if (!session) return { success: false, message: "No autorizado" };

    const updates = dataset.filter(d => d.status === 'MATCHED' && d.player?.id);
    let updatedCount = 0;
    let errorCount = 0;

    try {
        for (const item of updates) {
            if (!item.player?.id) continue;
            try {
                await (prisma.player as any).update({
                    where: { id: item.player.id },
                    data: {
                        lastSocialPayment: item.paymentStatus?.social,
                        lastActivityPayment: item.paymentStatus?.activity
                    }
                });
                updatedCount++;
            } catch (err) {
                errorCount++;
            }
        }
        await createAuditLog('IMPORT_PAYMENTS', 'Player', 'BATCH', { count: updatedCount, total: updates.length });
        revalidatePath('/dashboard/payments');
        return { success: true, message: `Se actualizaron ${updatedCount} registros correctamente.`, stats: { updated: updatedCount, errors: errorCount } };
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
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        const dbPlayers = await (prisma.player as any).findMany({
            select: { id: true, firstName: true, lastName: true, dni: true, tira: true, category: true, status: true }
        });
        const activePlayers = dbPlayers.filter((p: any) => p.status === 'ACTIVO' || p.status === 'REVISAR');

        const results: FederationMatchResult[] = [];
        let matchedCount = 0;

        for (const [index, row] of rawData.entries()) {
            const r = row as any;
            const dniKey = findColumn(r, ['dni', 'documento', 'documento_nro']);
            const nombreKey = findColumn(r, ['nombre', 'cliente', 'nombre y apellido']);
            const yearKey = findColumn(r, ['año', 'anio', 'year']);
            const cuotasKey = findColumn(r, ['cuotas', 'cuota', 'nro cuota']);
            const productosKey = findColumn(r, ['productos', 'item']);

            const dniVal = dniKey ? r[dniKey]?.toString().trim() : undefined;
            const dniClean = (dniVal && /\d+/.test(dniVal)) ? dniVal.replace(/\D/g, '') : undefined;
            let nombre = nombreKey ? normalizeString(r[nombreKey]?.toString()) : '';
            let apellido = '';

            if (nombre.includes(',')) {
                const parts = nombre.split(',');
                apellido = normalizeString(parts[0]);
                nombre = normalizeString(parts[1]);
            }

            let year = yearKey ? parseInt(r[yearKey]?.toString()) : NaN;
            let installments = cuotasKey ? r[cuotasKey]?.toString().trim() : '';

            if (productosKey && r[productosKey]) {
                const prodStr = r[productosKey].toString();
                let categoryFromExcel = '';

                if (isNaN(year)) {
                    const yearMatch = prodStr.match(/20\d{2}/);
                    if (yearMatch) year = parseInt(yearMatch[0]);
                }

                // Extract Category: "(Categoría: Mosquitos/U9/U11)"
                const catMatch = prodStr.match(/Categoría:\s*([^,)]+)/i);
                if (catMatch) categoryFromExcel = catMatch[1].trim();

                const instMatch = prodStr.match(/Cuota:\s*([^,)]+)/i);
                if (instMatch && (!installments || installments.toLowerCase().includes('finalizado'))) {
                    installments = instMatch[1].trim();
                }

                // Advanced installment extraction
                const allInsts = Array.from(prodStr.matchAll(/Cuota:\s*Cuota\s*(\d+)/gi)).map((m: any) => parseInt(m[1]));
                if (allInsts.length > 0) {
                    const maxInst = Math.max(...allInsts);
                    if (!installments || installments.toLowerCase().includes('finalizado')) {
                        installments = `Cuota ${maxInst}`;
                    }
                }

                // Normalization of "SALDADO" logic
                if (installments) {
                    const normalizedInst = installments.toLowerCase();
                    const isMosquitos = categoryFromExcel.toLowerCase().includes('mosquitos') ||
                        categoryFromExcel.toLowerCase().includes('u9') ||
                        categoryFromExcel.toLowerCase().includes('u11');

                    const instNumMatch = installments.match(/\d+/);
                    const instNum = instNumMatch ? parseInt(instNumMatch[0]) : 0;

                    if (normalizedInst.includes('saldado')) {
                        installments = 'SALDADO';
                    } else if (isMosquitos && instNum >= 1) {
                        installments = 'SALDADO';
                    } else if (!isMosquitos && instNum >= 3) {
                        installments = 'SALDADO';
                    }
                }
            }

            if (isNaN(year) || year === 0) {
                year = new Date().getFullYear();
            }

            let match: any;
            let method: 'DNI' | 'NAME_FUZZY' | undefined;

            if (dniClean && dniClean.length > 4) {
                match = activePlayers.find((p: any) => p.dni === dniClean);
                if (match) method = 'DNI';
            }
            if (!match && nombre) {
                const fullSearch = normalizeString(nombre + (apellido ? ' ' + apellido : ''));
                const searchParts = fullSearch.split(' ').filter(p => p.length > 2);
                match = activePlayers.find((p: any) => {
                    const dbFull = normalizeString(`${p.firstName} ${p.lastName}`);
                    const dbFullRev = normalizeString(`${p.lastName} ${p.firstName}`);
                    if (dbFull === fullSearch || dbFullRev === fullSearch) return true;
                    if (searchParts.length >= 2) return searchParts.every(part => dbFull.includes(part));
                    return false;
                });
                if (match) method = 'NAME_FUZZY';
            }

            const fedData = { year, installments: installments || '-' };

            if (match) {
                matchedCount++;
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
                    federationData: fedData,
                    notes: []
                });
            } else {
                results.push({ status: 'UNMATCHED', originalData: row, federationData: fedData, notes: ["No encontrado"] });
            }
        }

        return { success: true, stats: { total: rawData.length, matched: matchedCount, unmatched: rawData.length - matchedCount }, results, logs };
    } catch (e: any) {
        return { success: false, message: e.message, stats: { total: 0, matched: 0, unmatched: 0 }, results: [], logs: [e.message] };
    }
}

export async function saveFederationPaymentUpdates(prevState: any, dataset: FederationMatchResult[]) {
    const session = await auth();
    if (!session) return { success: false, message: "No autorizado" };

    const updates = dataset.filter(d => d.status === 'MATCHED' && d.player?.id);
    let updatedCount = 0;
    let errorCount = 0;

    try {
        console.log(`[FederationImport] Starting update for ${updates.length} players`);
        for (const item of updates) {
            if (!item.player?.id || !item.federationData) {
                console.log(`[FederationImport] Skipping item: No player id or federation data`, item);
                continue;
            }
            try {
                console.log(`[FederationImport] Updating player ${item.player.id} (${item.player.name}) with year: ${item.federationData.year}, installments: ${item.federationData.installments}`);
                await (prisma.player as any).update({
                    where: { id: item.player.id },
                    data: {
                        federationYear: item.federationData.year,
                        federationInstallments: item.federationData.installments
                    }
                });
                updatedCount++;
            } catch (err: any) {
                console.error(`[FederationImport] Error updating player ${item.player?.id}:`, err.message);
                errorCount++;
            }
        }
        console.log(`[FederationImport] Finished. Updated: ${updatedCount}, Errors: ${errorCount}`);
        await createAuditLog('IMPORT_FEDERATION_PAYMENTS', 'Player', 'BATCH', { count: updatedCount, total: updates.length });
        revalidatePath('/dashboard/payments');
        revalidatePath('/dashboard/players');
        revalidatePath('/dashboard/reports');
        return { success: true, message: `Se actualizaron ${updatedCount} registros de seguro correctamente.` };
    } catch (error: any) {
        return { success: false, message: "Error al guardar: " + error.message };
    }
}
