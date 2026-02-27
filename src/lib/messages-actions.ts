'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from './actions';

// ─── Types ───────────────────────────────────────────────────────────────────

export type VariableType = 'texto' | 'categoria' | 'horario' | 'lugar' | 'camiseta';

export interface TemplateVariable {
    name: string;
    type: VariableType;
}

// Parse variables field: supports both legacy CSV and new JSON format
export function parseVariables(raw: string): TemplateVariable[] {
    if (!raw || raw === '[]' || raw === '') return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((v: any) =>
                typeof v === 'string'
                    ? { name: v.trim(), type: 'texto' as VariableType }
                    : { name: v.name || '', type: (v.type as VariableType) || 'texto' }
            ).filter(v => v.name);
        }
    } catch {
        // Legacy: comma-separated string
        return raw.split(',').map(v => ({ name: v.trim(), type: 'texto' as VariableType })).filter(v => v.name);
    }
    return [];
}

export function serializeVariables(vars: TemplateVariable[]): string {
    return JSON.stringify(vars);
}

// ─── Permission Check ────────────────────────────────────────────────────────

async function checkPermission(permission: 'manage_messages' | 'view_messages') {
    const session = await auth();
    if (!session?.user) throw new Error('No autenticado');

    const role = session.user.role;
    if (role === 'ADMIN') return session;

    const perm = await (prisma as any).rolePermission.findFirst({
        where: { role, permission, enabled: true },
    });
    if (!perm) throw new Error('No autorizado');
    return session;
}

// ─── CRUD: MessageTemplate ───────────────────────────────────────────────────

export async function getMessageTemplates() {
    await checkPermission('view_messages');
    return (prisma as any).messageTemplate.findMany({
        orderBy: { name: 'asc' },
    });
}

export async function createMessageTemplate(data: {
    name: string;
    prompt: string;
    variables: string;
    content: string;
}) {
    await checkPermission('manage_messages');
    const template = await (prisma as any).messageTemplate.create({ data });
    await createAuditLog('CREATE', 'MessageTemplate', template.id, { name: data.name });
    revalidatePath('/dashboard/mensajes');
    return template;
}

export async function updateMessageTemplate(
    id: string,
    data: { name?: string; prompt?: string; variables?: string; content?: string }
) {
    await checkPermission('manage_messages');
    const template = await (prisma as any).messageTemplate.update({ where: { id }, data });
    await createAuditLog('UPDATE', 'MessageTemplate', id, data);
    revalidatePath('/dashboard/mensajes');
    return template;
}

export async function deleteMessageTemplate(id: string) {
    await checkPermission('manage_messages');
    await (prisma as any).messageTemplate.delete({ where: { id } });
    await createAuditLog('DELETE', 'MessageTemplate', id);
    revalidatePath('/dashboard/mensajes');
    return { success: true };
}

// ─── CRUD: Clubs ─────────────────────────────────────────────────────────────

export async function getClubs() {
    await checkPermission('view_messages');
    return (prisma as any).club.findMany({ orderBy: { name: 'asc' } });
}

export async function createClub(data: { name: string; address: string; mapsUrl: string }) {
    await checkPermission('manage_messages');
    const club = await (prisma as any).club.create({ data });
    await createAuditLog('CREATE', 'Club', club.id, { name: data.name });
    revalidatePath('/dashboard/mensajes');
    return club;
}

export async function updateClub(
    id: string,
    data: { name?: string; address?: string; mapsUrl?: string }
) {
    await checkPermission('manage_messages');
    const club = await (prisma as any).club.update({ where: { id }, data });
    await createAuditLog('UPDATE', 'Club', id, data);
    revalidatePath('/dashboard/mensajes');
    return club;
}

export async function deleteClub(id: string) {
    await checkPermission('manage_messages');
    await (prisma as any).club.delete({ where: { id } });
    await createAuditLog('DELETE', 'Club', id);
    revalidatePath('/dashboard/mensajes');
    return { success: true };
}

// ─── Query: Categories ───────────────────────────────────────────────────────

export async function getMessageCategories(): Promise<string[]> {
    await checkPermission('view_messages');
    try {
        const mappings = await (prisma as any).categoryMapping.findMany({
            orderBy: { category: 'asc' },
        });
        return mappings.map((m: any) => m.category as string);
    } catch {
        return [];
    }
}

// ─── AI: Generate template content via Gemini ────────────────────────────────

export async function askAIForTemplate(
    prompt: string,
    variables: string
): Promise<{ success: boolean; content?: string; error?: string }> {
    await checkPermission('manage_messages');

    let apiKey: string | undefined;
    try {
        const setting = await (prisma as any).systemSetting.findUnique({
            where: { key: 'GEMINI_API_KEY' },
        });
        apiKey = setting?.value || process.env.GEMINI_API_KEY;
    } catch {
        apiKey = process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
        return {
            success: false,
            error: 'No se configuró una API Key de Gemini. Configurala en Administración → Integraciones.',
        };
    }

    const parsedVars = parseVariables(variables);
    const varList = parsedVars.map(v => v.name).filter(Boolean);

    const systemInstructions = `Eres un asistente que genera mensajes de WhatsApp para un club de básquet llamado "All Boys".
Tus respuestas deben ser SOLO el texto del mensaje, sin comillas, sin explicaciones, sin encabezados.
El mensaje debe ser amigable, directo y conciso. Usá un tono informal pero respetuoso.
${varList.length > 0
            ? `Incluí los siguientes placeholders exactos tal como aparecen (entre dobles llaves): ${varList.map(v => `{{${v}}}`).join(', ')}.
Cada placeholder DEBE aparecer al menos una vez en el mensaje.`
            : ''}`;

    const userMessage = `Genera un mensaje de WhatsApp con las siguientes instrucciones: "${prompt}"`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstructions }] },
                    contents: [{ parts: [{ text: userMessage }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
                }),
            }
        );

        if (!response.ok) {
            const err = await response.json();
            return { success: false, error: err?.error?.message || 'Error en la API de Gemini' };
        }

        const data = await response.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!content) {
            return { success: false, error: 'La IA no devolvió contenido. Intenta reformular el prompt.' };
        }

        return { success: true, content };
    } catch (e: any) {
        console.error('[Gemini] Error:', e);
        return { success: false, error: e.message || 'Error de red al contactar la API de Gemini' };
    }
}
