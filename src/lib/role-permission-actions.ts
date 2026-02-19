'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, type Role, type Permission, EDITABLE_ROLES } from './roles';

function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Obtiene los permisos para un rol.
 * ADMIN siempre recibe todos los permisos sin consultar la BD.
 * Para el resto, usa la BD (inicializando con defaults si no existen).
 */
export async function getPermissionsForRole(role: string): Promise<Permission[]> {
    if (role === ROLES.ADMIN) {
        return Object.values(PERMISSIONS) as Permission[];
    }

    const roleKey = role as Role;
    if (!EDITABLE_ROLES.includes(roleKey)) return [];

    const dbPerms = await (prisma as any).rolePermission.findMany({
        where: { role },
    });

    // Si no hay registros en la BD, inicializar con defaults
    if (dbPerms.length === 0) {
        await initializeDefaultPermissions(roleKey);
        return DEFAULT_ROLE_PERMISSIONS[roleKey] || [];
    }

    return dbPerms
        .filter((p: any) => p.enabled)
        .map((p: any) => p.permission as Permission);
}

/**
 * Carga todos los permisos de todos los roles editables para el panel admin.
 * Retorna un mapa: { role -> { permission -> enabled } }
 */
export async function getAllRolePermissions(): Promise<Record<string, Record<string, boolean>>> {
    const result: Record<string, Record<string, boolean>> = {};

    for (const role of EDITABLE_ROLES) {
        const dbPerms = await (prisma as any).rolePermission.findMany({ where: { role } });

        // Inicializar con defaults si la tabla está vacía para este rol
        if (dbPerms.length === 0) {
            await initializeDefaultPermissions(role);
        }

        result[role] = {};
        const allPerms = Object.values(PERMISSIONS) as Permission[];
        const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];

        for (const perm of allPerms) {
            const dbPerm = dbPerms.find((p: any) => p.permission === perm);
            result[role][perm] = dbPerm ? dbPerm.enabled : defaults.includes(perm);
        }
    }

    return result;
}

async function initializeDefaultPermissions(role: Role) {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
    const allPerms = Object.values(PERMISSIONS) as Permission[];
    const now = new Date();

    for (const perm of allPerms) {
        try {
            await (prisma as any).rolePermission.upsert({
                where: { role_permission: { role, permission: perm } },
                update: {},
                create: {
                    id: generateId(),
                    role,
                    permission: perm,
                    enabled: defaults.includes(perm),
                    updatedAt: now,
                },
            });
        } catch {
            // Si ya existe, ignorar
        }
    }
}

/**
 * Actualiza un permiso específico para un rol (solo ADMIN puede hacerlo).
 */
export async function updateRolePermission(
    role: string,
    permission: string,
    enabled: boolean
): Promise<{ success: boolean; message?: string }> {
    const session = await auth();
    if ((session?.user as any)?.role !== ROLES.ADMIN) {
        return { success: false, message: 'No autorizado' };
    }

    if (role === ROLES.ADMIN) {
        return { success: false, message: 'Los permisos de ADMIN no son editables' };
    }

    try {
        await (prisma as any).rolePermission.upsert({
            where: { role_permission: { role, permission } },
            update: { enabled, updatedAt: new Date() },
            create: {
                id: generateId(),
                role,
                permission,
                enabled,
                updatedAt: new Date(),
            },
        });

        revalidatePath('/dashboard/administracion/roles');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Verifica si un rol tiene un permiso específico.
 * Usa la BD (o defaults si no inicializado).
 */
export async function hasPermission(role: string, permission: Permission): Promise<boolean> {
    if (role === ROLES.ADMIN) return true;
    const perms = await getPermissionsForRole(role);
    return perms.includes(permission);
}
