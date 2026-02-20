module.exports = [
"[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00172bdecf9bdacb64dd4c5180e9c8675d7b15d573":"handleSignOut"},"",""] */ __turbopack_context__.s([
    "handleSignOut",
    ()=>handleSignOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function handleSignOut() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signOut"])();
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    handleSignOut
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(handleSignOut, "00172bdecf9bdacb64dd4c5180e9c8675d7b15d573", null);
}),
"[project]/src/lib/utils.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "evaluatePlayerStatus",
    ()=>evaluatePlayerStatus,
    "formatCurrency",
    ()=>formatCurrency,
    "getCategory",
    ()=>getCategory
]);
function getCategory(player, mappings) {
    // 1. Manual override priority
    if (player.category) return player.category;
    // 2. BirthDate logic
    if (!player.birthDate) return "REVISAR";
    const date = new Date(player.birthDate);
    if (isNaN(date.getTime()) || date.getTime() <= 0) return "REVISAR";
    const year = date.getFullYear();
    if (year <= 1970) return "REVISAR";
    if (mappings && mappings.length > 0) {
        const found = mappings.find((m)=>year >= m.minYear && year <= m.maxYear);
        if (found) return found.category;
    }
    const today = new Date();
    const currentYear = today.getFullYear();
    const age = currentYear - year;
    if (age < 9) return "Mosquitos";
    if (age <= 10) return "Pre-Mini";
    if (age <= 12) return "Mini";
    if (age <= 13) return "U13";
    if (age <= 15) return "U15";
    if (age <= 17) return "U17";
    if (age <= 19) return "U19";
    return "Primera";
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
}
function evaluatePlayerStatus(currentStatus, dni, birthDate) {
    if (currentStatus !== 'REVISAR') return currentStatus;
    if (!dni || dni.startsWith('TEMP-')) return 'REVISAR';
    if (!birthDate) return 'REVISAR';
    const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (isNaN(date.getTime())) return 'REVISAR';
    const year = date.getFullYear();
    // Default/Legacy invalid years
    if (year <= 1970 || year === 1900) return 'REVISAR';
    // If we are here, data is real and complete. Auto-promote to ACTIVO.
    return 'ACTIVO';
}
}),
"[project]/src/lib/bulk-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a92a4d675b3b4d51ffbb58ef8a32e71f9d6f0ae5":"bulkDeletePlayers","605e77fa7193052f6437ee7c223289f1becabdea3e":"bulkUpdatePlayers"},"",""] */ __turbopack_context__.s([
    "bulkDeletePlayers",
    ()=>bulkDeletePlayers,
    "bulkUpdatePlayers",
    ()=>bulkUpdatePlayers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function bulkUpdatePlayers(playerIds, updates) {
    if (!playerIds.length) return {
        success: false,
        message: "No se seleccionaron jugadores"
    };
    try {
        // We fetch players to evaluate status correctly for each
        const players = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findMany({
            where: {
                id: {
                    in: playerIds
                }
            },
            select: {
                id: true,
                status: true,
                dni: true,
                birthDate: true
            }
        });
        for (const player of players){
            const newStatus = updates.status || player.status;
            const finalStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluatePlayerStatus"])(newStatus, player.dni, player.birthDate);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.update({
                where: {
                    id: player.id
                },
                data: {
                    ...updates,
                    status: finalStatus
                }
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/players");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/categories");
        return {
            success: true,
            message: `Se actualizaron ${playerIds.length} jugadores.`
        };
    } catch (error) {
        return {
            success: false,
            message: "Error en actualización masiva: " + error.message
        };
    }
}
async function bulkDeletePlayers(playerIds) {
    if (!playerIds.length) return {
        success: false,
        message: "No se seleccionaron jugadores"
    };
    try {
        // Warning: This is destructive. Admin only check should be at route level.
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.deleteMany({
            where: {
                id: {
                    in: playerIds
                }
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/players");
        return {
            success: true,
            message: `Se eliminaron ${playerIds.length} jugadores.`
        };
    } catch (error) {
        return {
            success: false,
            message: "Error al eliminar jugadores: " + error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    bulkUpdatePlayers,
    bulkDeletePlayers
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(bulkUpdatePlayers, "605e77fa7193052f6437ee7c223289f1becabdea3e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(bulkDeletePlayers, "40a92a4d675b3b4d51ffbb58ef8a32e71f9d6f0ae5", null);
}),
"[project]/.next-internal/server/app/dashboard/players/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/lib/bulk-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$bulk$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/bulk-actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/dashboard/players/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/lib/bulk-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00172bdecf9bdacb64dd4c5180e9c8675d7b15d573",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["handleSignOut"],
    "00389c4dee762c9752fa78abeb9062f32a2bc77388",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllRolePermissions"],
    "405b1fff19e2829eba6c9bf3e477254b7973b8a323",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPermissionsForRole"],
    "40a92a4d675b3b4d51ffbb58ef8a32e71f9d6f0ae5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$bulk$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["bulkDeletePlayers"],
    "6028f758cf28d192fd5c86810b2b38b40bb85b5b68",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasPermission"],
    "605e77fa7193052f6437ee7c223289f1becabdea3e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$bulk$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["bulkUpdatePlayers"],
    "70b175dc5144eb864d129ad1d180d711c56c75c19e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateRolePermission"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$players$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$dashboard$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$lib$2f$bulk$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/dashboard/players/page/actions.js { ACTIONS_MODULE0 => "[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/lib/bulk-actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$bulk$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/bulk-actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_87884a15._.js.map