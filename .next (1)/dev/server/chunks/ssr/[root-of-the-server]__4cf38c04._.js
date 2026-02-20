module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/auth.config.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authConfig",
    ()=>authConfig
]);
const authConfig = {
    pages: {
        signIn: '/login'
    },
    callbacks: {
        authorized ({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isLoginPage = nextUrl.pathname === '/login';
            const isRootPage = nextUrl.pathname === '/';
            console.log('Middleware Authorized Check:', {
                pathname: nextUrl.pathname,
                isLoggedIn
            });
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && (isLoginPage || isRootPage)) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        }
    },
    providers: []
};
}),
"[project]/src/lib/prisma.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const prisma = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        'query'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/auth.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "handlers",
    ()=>handlers,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/auth.config.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/core/providers/credentials.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function getUser(email) {
    try {
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email
            }
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}
const { auth, signIn, signOut, handlers } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    debug: true,
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authConfig"],
    callbacks: {
        async signIn ({ user, account }) {
            if (account?.provider === "google") {
                const dbUser = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                    where: {
                        email: user.email
                    }
                });
                return !!dbUser; // Only allow if exists in DB
            }
            return true;
        },
        async jwt ({ token, user, trigger, session }) {
            if (user) {
                // Initial login
                const dbUser = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                    where: {
                        email: user.email
                    }
                });
                token.id = dbUser?.id || user.id;
                token.role = dbUser?.role || 'VIEWER';
            }
            return token;
        },
        async session ({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])({
            async authorize (credentials) {
                const parsedCredentials = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
                    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
                    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(6)
                }).safeParse(credentials);
                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    if (!user.password) return null; // User might be OAuth only
                    const passwordsMatch = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].compare(password, user.password);
                    if (passwordsMatch) return user;
                }
                console.log('Invalid credentials');
                return null;
            }
        })
    ]
});
}),
"[project]/src/app/dashboard/dashboard-layout-client.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/dashboard/dashboard-layout-client.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/dashboard/dashboard-layout-client.tsx <module evaluation>", "default");
}),
"[project]/src/app/dashboard/dashboard-layout-client.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/dashboard/dashboard-layout-client.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/dashboard/dashboard-layout-client.tsx", "default");
}),
"[project]/src/app/dashboard/dashboard-layout-client.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$dashboard$2d$layout$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/dashboard/dashboard-layout-client.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$dashboard$2d$layout$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/dashboard-layout-client.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$dashboard$2d$layout$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/lib/roles.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Sistema central de roles y permisos.
 * Los permisos "fijos" se definen aquí; la tabla RolePermission en DB
 * permite que el ADMIN los ajuste without redeploy para SUB_COMISION,
 * COORDINADOR y ENTRENADOR.
 * ADMIN siempre tiene todos los permisos y no es editable.
 */ __turbopack_context__.s([
    "DEFAULT_ROLE_PERMISSIONS",
    ()=>DEFAULT_ROLE_PERMISSIONS,
    "EDITABLE_ROLES",
    ()=>EDITABLE_ROLES,
    "PERMISSIONS",
    ()=>PERMISSIONS,
    "PERMISSION_GROUPS",
    ()=>PERMISSION_GROUPS,
    "PERMISSION_LABELS",
    ()=>PERMISSION_LABELS,
    "ROLES",
    ()=>ROLES,
    "isAdmin",
    ()=>isAdmin
]);
const ROLES = {
    ADMIN: 'ADMIN',
    SUB_COMISION: 'SUB_COMISION',
    COORDINADOR: 'COORDINADOR',
    ENTRENADOR: 'ENTRENADOR'
};
const PERMISSIONS = {
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
    BACKUP_RESTORE: 'backup_restore'
};
const DEFAULT_ROLE_PERMISSIONS = {
    ADMIN: Object.values(PERMISSIONS),
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
        PERMISSIONS.BACKUP_EXPORT
    ],
    COORDINADOR: [
        PERMISSIONS.VIEW_PLAYERS,
        PERMISSIONS.EDIT_PLAYERS,
        PERMISSIONS.VIEW_COACHES,
        PERMISSIONS.VIEW_TEAMS,
        PERMISSIONS.TAKE_ATTENDANCE,
        PERMISSIONS.VIEW_REPORT_ATTENDANCE,
        PERMISSIONS.VIEW_REPORT_SALARIES,
        PERMISSIONS.VIEW_REPORT_PAYMENTS
    ],
    ENTRENADOR: [
        PERMISSIONS.VIEW_PLAYERS,
        PERMISSIONS.VIEW_COACHES,
        PERMISSIONS.VIEW_TEAMS,
        PERMISSIONS.TAKE_ATTENDANCE,
        PERMISSIONS.VIEW_REPORT_ATTENDANCE
    ]
};
const PERMISSION_LABELS = {
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
    backup_restore: 'Restaurar Backup'
};
const PERMISSION_GROUPS = [
    {
        label: '🏀 Jugadores',
        permissions: [
            PERMISSIONS.VIEW_PLAYERS,
            PERMISSIONS.EDIT_PLAYERS
        ]
    },
    {
        label: '🧢 Entrenadores',
        permissions: [
            PERMISSIONS.VIEW_COACHES,
            PERMISSIONS.EDIT_COACHES,
            PERMISSIONS.VIEW_COACH_SALARY
        ]
    },
    {
        label: '🛡️ Equipos & Asistencia',
        permissions: [
            PERMISSIONS.VIEW_TEAMS,
            PERMISSIONS.TAKE_ATTENDANCE
        ]
    },
    {
        label: '💰 Pagos',
        permissions: [
            PERMISSIONS.VIEW_PAYMENTS
        ]
    },
    {
        label: '📊 Informes',
        permissions: [
            PERMISSIONS.VIEW_REPORT_ATTENDANCE,
            PERMISSIONS.VIEW_REPORT_SALARIES,
            PERMISSIONS.VIEW_REPORT_PAYMENTS
        ]
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
            PERMISSIONS.BACKUP_RESTORE
        ]
    }
];
function isAdmin(role) {
    return role === ROLES.ADMIN;
}
const EDITABLE_ROLES = [
    ROLES.SUB_COMISION,
    ROLES.COORDINADOR,
    ROLES.ENTRENADOR
];
}),
"[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00389c4dee762c9752fa78abeb9062f32a2bc77388":"getAllRolePermissions","405b1fff19e2829eba6c9bf3e477254b7973b8a323":"getPermissionsForRole","6028f758cf28d192fd5c86810b2b38b40bb85b5b68":"hasPermission","70b175dc5144eb864d129ad1d180d711c56c75c19e":"updateRolePermission"},"",""] */ __turbopack_context__.s([
    "getAllRolePermissions",
    ()=>getAllRolePermissions,
    "getPermissionsForRole",
    ()=>getPermissionsForRole,
    "hasPermission",
    ()=>hasPermission,
    "updateRolePermission",
    ()=>updateRolePermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/roles.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
async function getPermissionsForRole(role) {
    if (role === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLES"].ADMIN) {
        return Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PERMISSIONS"]);
    }
    const roleKey = role;
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EDITABLE_ROLES"].includes(roleKey)) return [];
    const dbPerms = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].rolePermission.findMany({
        where: {
            role
        }
    });
    // Si no hay registros en la BD, inicializar con defaults
    if (dbPerms.length === 0) {
        await initializeDefaultPermissions(roleKey);
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_ROLE_PERMISSIONS"][roleKey] || [];
    }
    return dbPerms.filter((p)=>p.enabled).map((p)=>p.permission);
}
async function getAllRolePermissions() {
    const result = {};
    for (const role of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EDITABLE_ROLES"]){
        const dbPerms = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].rolePermission.findMany({
            where: {
                role
            }
        });
        // Inicializar con defaults si la tabla está vacía para este rol
        if (dbPerms.length === 0) {
            await initializeDefaultPermissions(role);
        }
        result[role] = {};
        const allPerms = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PERMISSIONS"]);
        const defaults = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_ROLE_PERMISSIONS"][role] || [];
        for (const perm of allPerms){
            const dbPerm = dbPerms.find((p)=>p.permission === perm);
            result[role][perm] = dbPerm ? dbPerm.enabled : defaults.includes(perm);
        }
    }
    return result;
}
async function initializeDefaultPermissions(role) {
    const defaults = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_ROLE_PERMISSIONS"][role] || [];
    const allPerms = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PERMISSIONS"]);
    const now = new Date();
    for (const perm of allPerms){
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].rolePermission.upsert({
                where: {
                    role_permission: {
                        role,
                        permission: perm
                    }
                },
                update: {},
                create: {
                    id: generateId(),
                    role,
                    permission: perm,
                    enabled: defaults.includes(perm),
                    updatedAt: now
                }
            });
        } catch  {
        // Si ya existe, ignorar
        }
    }
}
async function updateRolePermission(role, permission, enabled) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (session?.user?.role !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLES"].ADMIN) {
        return {
            success: false,
            message: 'No autorizado'
        };
    }
    if (role === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLES"].ADMIN) {
        return {
            success: false,
            message: 'Los permisos de ADMIN no son editables'
        };
    }
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].rolePermission.upsert({
            where: {
                role_permission: {
                    role,
                    permission
                }
            },
            update: {
                enabled,
                updatedAt: new Date()
            },
            create: {
                id: generateId(),
                role,
                permission,
                enabled,
                updatedAt: new Date()
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard/administracion/roles');
        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}
async function hasPermission(role, permission) {
    if (role === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLES"].ADMIN) return true;
    const perms = await getPermissionsForRole(role);
    return perms.includes(permission);
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getPermissionsForRole,
    getAllRolePermissions,
    updateRolePermission,
    hasPermission
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getPermissionsForRole, "405b1fff19e2829eba6c9bf3e477254b7973b8a323", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getAllRolePermissions, "00389c4dee762c9752fa78abeb9062f32a2bc77388", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateRolePermission, "70b175dc5144eb864d129ad1d180d711c56c75c19e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(hasPermission, "6028f758cf28d192fd5c86810b2b38b40bb85b5b68", null);
}),
"[project]/src/app/dashboard/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$dashboard$2d$layout$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/dashboard-layout-client.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)");
;
;
;
;
async function DashboardLayout({ children }) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    const role = session?.user?.role || 'ENTRENADOR';
    const userName = session?.user?.name;
    const permissions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPermissionsForRole"])(role);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$dashboard$2d$layout$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        role: role,
        userName: userName,
        permissions: permissions,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/dashboard/layout.tsx",
        lineNumber: 16,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4cf38c04._.js.map