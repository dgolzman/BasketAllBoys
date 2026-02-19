/**
 * Sistema central de roles y permisos.
 * Los permisos "fijos" se definen aquí; la tabla RolePermission en DB
 * permite que el ADMIN los ajuste without redeploy para SUB_COMISION,
 * COORDINADOR y ENTRENADOR.
 * ADMIN siempre tiene todos los permisos y no es editable.
 */

export const ROLES = {
    ADMIN: 'ADMIN',
    SUB_COMISION: 'SUB_COMISION',
    COORDINADOR: 'COORDINADOR',
    ENTRENADOR: 'ENTRENADOR',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Lista de todos los permisos posibles del sistema
export const PERMISSIONS = {
    // Jugadores
    VIEW_PLAYERS: 'view_players',
    EDIT_PLAYERS: 'edit_players',
    // Entrenadores
    VIEW_COACHES: 'view_coaches',
    EDIT_COACHES: 'edit_coaches',
    VIEW_COACH_SALARY: 'view_coach_salary',
    // Equipos / Categorías
    VIEW_TEAMS: 'view_teams',
    // Pagos
    VIEW_PAYMENTS: 'view_payments',
    // Asistencia
    TAKE_ATTENDANCE: 'take_attendance',
    // Informes
    VIEW_REPORT_ATTENDANCE: 'view_report_attendance',
    VIEW_REPORT_SALARIES: 'view_report_salaries',
    VIEW_REPORT_PAYMENTS: 'view_report_payments',
    // Administración
    ACCESS_ADMIN: 'access_admin',
    MANAGE_USERS: 'manage_users',
    MANAGE_CATEGORY_MAPPING: 'manage_category_mapping',
    IMPORT_DATA: 'import_data',
    VIEW_AUDIT: 'view_audit',
    MANAGE_DUPLICATES: 'manage_duplicates',
    BACKUP_EXPORT: 'backup_export',
    BACKUP_RESTORE: 'backup_restore',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Permisos por defecto para cada rol (usados al inicializar la app) */
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    ADMIN: Object.values(PERMISSIONS) as Permission[],

    SUB_COMISION: [
        PERMISSIONS.VIEW_PLAYERS,
        PERMISSIONS.EDIT_PLAYERS,
        PERMISSIONS.VIEW_COACHES,
        PERMISSIONS.EDIT_COACHES,
        PERMISSIONS.VIEW_COACH_SALARY,
        PERMISSIONS.VIEW_TEAMS,
        PERMISSIONS.VIEW_PAYMENTS,
        PERMISSIONS.TAKE_ATTENDANCE,
        PERMISSIONS.VIEW_REPORT_ATTENDANCE,
        PERMISSIONS.VIEW_REPORT_SALARIES,
        PERMISSIONS.VIEW_REPORT_PAYMENTS,
        PERMISSIONS.ACCESS_ADMIN,
        PERMISSIONS.MANAGE_CATEGORY_MAPPING,
        PERMISSIONS.VIEW_AUDIT,
        PERMISSIONS.BACKUP_EXPORT,
    ],

    COORDINADOR: [
        PERMISSIONS.VIEW_PLAYERS,
        PERMISSIONS.EDIT_PLAYERS,
        PERMISSIONS.VIEW_COACHES,
        PERMISSIONS.VIEW_TEAMS,
        PERMISSIONS.TAKE_ATTENDANCE,
        PERMISSIONS.VIEW_REPORT_ATTENDANCE,
        PERMISSIONS.VIEW_REPORT_SALARIES,
        PERMISSIONS.VIEW_REPORT_PAYMENTS,
    ],

    ENTRENADOR: [
        PERMISSIONS.VIEW_PLAYERS,
        PERMISSIONS.VIEW_COACHES,
        PERMISSIONS.VIEW_TEAMS,
        PERMISSIONS.TAKE_ATTENDANCE,
        PERMISSIONS.VIEW_REPORT_ATTENDANCE,
    ],
};

/** Labels legibles para mostrar en el panel de gestión de permisos */
export const PERMISSION_LABELS: Record<Permission, string> = {
    view_players: 'Ver Jugadores',
    edit_players: 'Editar/Crear Jugadores',
    view_coaches: 'Ver Entrenadores',
    edit_coaches: 'Editar/Crear Entrenadores',
    view_coach_salary: 'Ver Sueldos de Entrenadores',
    view_teams: 'Ver Equipos/Categorías',
    view_payments: 'Ver y Gestionar Pagos',
    take_attendance: 'Tomar Asistencia',
    view_report_attendance: 'Informe de Asistencia',
    view_report_salaries: 'Informe de Sueldos',
    view_report_payments: 'Informe de Pagos',
    access_admin: 'Acceder al Panel de Administración',
    manage_users: 'Gestionar Usuarios',
    manage_category_mapping: 'Mapeo de Categorías',
    import_data: 'Importar Datos',
    view_audit: 'Ver Auditoría',
    manage_duplicates: 'Gestionar Duplicados',
    backup_export: 'Exportar Backup',
    backup_restore: 'Restaurar Backup',
};

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
    {
        label: '🏀 Jugadores',
        permissions: [PERMISSIONS.VIEW_PLAYERS, PERMISSIONS.EDIT_PLAYERS],
    },
    {
        label: '🧢 Entrenadores',
        permissions: [PERMISSIONS.VIEW_COACHES, PERMISSIONS.EDIT_COACHES, PERMISSIONS.VIEW_COACH_SALARY],
    },
    {
        label: '🛡️ Equipos & Asistencia',
        permissions: [PERMISSIONS.VIEW_TEAMS, PERMISSIONS.TAKE_ATTENDANCE],
    },
    {
        label: '💰 Pagos',
        permissions: [PERMISSIONS.VIEW_PAYMENTS],
    },
    {
        label: '📊 Informes',
        permissions: [
            PERMISSIONS.VIEW_REPORT_ATTENDANCE,
            PERMISSIONS.VIEW_REPORT_SALARIES,
            PERMISSIONS.VIEW_REPORT_PAYMENTS,
        ],
    },
    {
        label: '⚙️ Administración',
        permissions: [
            PERMISSIONS.ACCESS_ADMIN,
            PERMISSIONS.MANAGE_USERS,
            PERMISSIONS.MANAGE_CATEGORY_MAPPING,
            PERMISSIONS.IMPORT_DATA,
            PERMISSIONS.VIEW_AUDIT,
            PERMISSIONS.MANAGE_DUPLICATES,
            PERMISSIONS.BACKUP_EXPORT,
            PERMISSIONS.BACKUP_RESTORE,
        ],
    },
];

/** ADMIN siempre tiene todos los permisos sin ir a la BD */
export function isAdmin(role: string): boolean {
    return role === ROLES.ADMIN;
}

export const EDITABLE_ROLES: Role[] = [ROLES.SUB_COMISION, ROLES.COORDINADOR, ROLES.ENTRENADOR];
