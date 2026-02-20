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
"[project]/src/lib/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00c9c8207af3b4e5dd154f76239020976e6ae3761d":"deleteAllPlayers","4043ec93fd4e1586978a54aaa3c74c7b68447dbd89":"searchPlayers","40697605e5cedcb89b2e5e98e9ff84bb9dc56bff2a":"getPlayersByNames","603226f502e3e5a984b300dcc33f7dbf9511ee204f":"dismissAuditIssue","6051d2edb36988f34aee8495f9a6e06cae88943f6a":"createPlayer","60f4256a91c7f83866fc8fba494a8555de3997a8ca":"deletePlayer","70469a6e29bd572e07aa54791db2f8050e5cc91c58":"updatePlayer","7823e2e29cd5ccd94e134d24941da2d652c6a07dd4":"createAuditLog"},"",""] */ __turbopack_context__.s([
    "createAuditLog",
    ()=>createAuditLog,
    "createPlayer",
    ()=>createPlayer,
    "deleteAllPlayers",
    ()=>deleteAllPlayers,
    "deletePlayer",
    ()=>deletePlayer,
    "dismissAuditIssue",
    ()=>dismissAuditIssue,
    "getPlayersByNames",
    ()=>getPlayersByNames,
    "searchPlayers",
    ()=>searchPlayers,
    "updatePlayer",
    ()=>updatePlayer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const FormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    firstName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Nombre es obligatorio"),
    lastName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Apellido es obligatorio"),
    dni: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "DNI es obligatorio").refine((val)=>/^\d{7,12}$/.test(val) || /^TEMP-/.test(val), "El DNI debe tener entre 7 y 12 dígitos, o comenzar con TEMP-"),
    birthDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Fecha de nacimiento es obligatoria"),
    tira: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    scholarship: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    playsPrimera: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email().optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("")),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().refine((val)=>!val || /^\+?\d+$/.test(val), "El teléfono debe contener solo números, opcionalmente iniciando con '+"),
    partnerNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    contactName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    shirtNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().optional(),
    observations: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    registrationDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    withdrawalDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "ACTIVO",
        "INACTIVO",
        "REVISAR"
    ]).default("ACTIVO"),
    siblings: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    federationYear: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().optional(),
    federationInstallments: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
function sanitizeDNI(dni) {
    if (!dni) return `TEMP-${Date.now()}`;
    const str = String(dni);
    // Preserve TEMP- prefix if already set
    if (str.startsWith('TEMP-')) return str;
    const sanitized = str.replace(/\D/g, "");
    return sanitized.length > 0 ? sanitized : `TEMP-${Date.now()}`;
}
async function createAuditLog(action, entity, entityId, details) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    const userId = session?.user?.id;
    if (userId) {
        // Double check if user exists in DB to avoid FK violations (e.g. after DB reset)
        const userExists = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                id: userId
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : null,
                userId: userExists ? userId : null
            }
        });
    }
}
async function createPlayer(prevState, formData) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    const role = session?.user?.role || 'VIEWER';
    if (!session || role !== 'ADMIN' && role !== 'OPERADOR') {
        return {
            message: "No tiene permisos para realizar esta acción",
            errors: undefined
        };
    }
    const scholarship = formData.get("scholarship") === "on";
    const federated = formData.get("federated") === "on";
    const playsPrimera = formData.get("playsPrimera") === "on";
    const shirtNumberRaw = formData.get("shirtNumber");
    const shirtNumber = shirtNumberRaw && shirtNumberRaw !== "" ? parseInt(shirtNumberRaw.toString()) : null;
    const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        dni: sanitizeDNI(formData.get("dni")),
        birthDate: formData.get("birthDate"),
        tira: formData.get("tira"),
        scholarship: scholarship,
        federated: federated,
        playsPrimera: playsPrimera,
        email: formData.get("email"),
        phone: formData.get("phone"),
        // Extras
        partnerNumber: formData.get("partnerNumber"),
        contactName: formData.get("contactName"),
        shirtNumber: shirtNumber,
        observations: formData.get("observations"),
        registrationDate: formData.get("registrationDate"),
        status: formData.get("status") || "ACTIVO",
        siblings: formData.get("siblings"),
        category: formData.get("category"),
        federationYear: formData.get("federationYear"),
        federationInstallments: formData.get("federationInstallments")
    };
    const validatedFields = FormSchema.safeParse(rawData);
    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten());
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Faltan campos obligatorios."
        };
    }
    const data = validatedFields.data;
    // Shirt Number Validation (0-99, optional, adjacent categories)
    if (shirtNumber !== null) {
        if (shirtNumber < 0 || shirtNumber > 99) {
            return {
                message: "El número de camiseta debe estar entre 0 y 99.",
                errors: {
                    shirtNumber: [
                        "Rango inválido"
                    ]
                }
            };
        }
        const shirtError = await validateShirtNumber(null, shirtNumber, data.tira, data.birthDate, data.category);
        if (shirtError) return {
            message: shirtError,
            errors: {
                shirtNumber: [
                    shirtError
                ]
            }
        };
    }
    try {
        const playerName = `${data.lastName.toUpperCase()}, ${data.firstName.toUpperCase()}`;
        const player = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.create({
            data: {
                firstName: data.firstName.toUpperCase(),
                lastName: data.lastName.toUpperCase(),
                dni: data.dni,
                birthDate: new Date(data.birthDate),
                tira: data.tira,
                scholarship: scholarship,
                federated: federated,
                playsPrimera: playsPrimera,
                email: data.email || null,
                phone: data.phone || null,
                partnerNumber: data.partnerNumber || null,
                contactName: data.contactName ? data.contactName.toUpperCase() : null,
                shirtNumber: data.shirtNumber || null,
                observations: data.observations ? data.observations.toUpperCase() : null,
                registrationDate: data.registrationDate ? new Date(data.registrationDate) : null,
                siblings: data.siblings ? data.siblings.toUpperCase() : null,
                category: data.category || null,
                status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluatePlayerStatus"])(data.status, data.dni, data.birthDate),
                federationYear: data.federationYear || null,
                federationInstallments: data.federationInstallments || null
            }
        });
        // Bidirectional siblings: Update all chosen siblings to include this new player
        const siblingIds = formData.get("siblingIds")?.toString();
        if (siblingIds) {
            const ids = siblingIds.split(',').filter(Boolean);
            for (const sId of ids){
                const sPlayer = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findUnique({
                    where: {
                        id: sId
                    }
                });
                if (sPlayer) {
                    const currentSiblings = sPlayer.siblings ? sPlayer.siblings.split(';').map((s)=>s.trim()) : [];
                    if (!currentSiblings.includes(playerName)) {
                        currentSiblings.push(playerName);
                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.update({
                            where: {
                                id: sId
                            },
                            data: {
                                siblings: currentSiblings.join('; ')
                            }
                        });
                    }
                }
            }
        }
        await createAuditLog("CREATE", "Player", player.id, rawData);
    } catch (error) {
        console.error("Create Player Error:", error);
        if (error.code === 'P2002') return {
            message: "El DNI ya existe."
        };
        return {
            message: "Error al crear jugador: " + error.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/players");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/dashboard/players");
}
async function updatePlayer(id, prevState, formData) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    const role = session?.user?.role || 'VIEWER';
    if (!session || role !== 'ADMIN' && role !== 'OPERADOR') {
        return {
            message: "No tiene permisos para realizar esta acción",
            errors: undefined
        };
    }
    const scholarship = formData.get("scholarship") === "on";
    const federated = formData.get("federated") === "on";
    const playsPrimera = formData.get("playsPrimera") === "on";
    const shirtNumberRaw = formData.get("shirtNumber");
    const shirtNumber = shirtNumberRaw && shirtNumberRaw !== "" ? parseInt(shirtNumberRaw.toString()) : null;
    const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        dni: sanitizeDNI(formData.get("dni")),
        birthDate: formData.get("birthDate"),
        tira: formData.get("tira"),
        scholarship: scholarship,
        federated: federated,
        playsPrimera: playsPrimera,
        email: formData.get("email"),
        phone: formData.get("phone"),
        partnerNumber: formData.get("partnerNumber"),
        contactName: formData.get("contactName"),
        shirtNumber: shirtNumber,
        observations: formData.get("observations"),
        registrationDate: formData.get("registrationDate"),
        withdrawalDate: formData.get("withdrawalDate"),
        status: formData.get("status") || "ACTIVO",
        siblings: formData.get("siblings"),
        category: formData.get("category"),
        federationYear: formData.get("federationYear"),
        federationInstallments: formData.get("federationInstallments")
    };
    // Manual date parsing check to avoid crash
    const parseDate = (d)=>{
        if (!d) return null;
        const date = new Date(d);
        return isNaN(date.getTime()) ? null : date;
    };
    // Shirt Number Validation
    if (shirtNumber !== null) {
        if (shirtNumber < 0 || shirtNumber > 99) {
            return {
                message: "El número de camiseta debe estar entre 0 y 99.",
                errors: {
                    shirtNumber: [
                        "Rango inválido"
                    ]
                }
            };
        }
        const shirtError = await validateShirtNumber(id, shirtNumber, rawData.tira, rawData.birthDate, rawData.category);
        if (shirtError) return {
            message: shirtError,
            errors: {
                shirtNumber: [
                    shirtError
                ]
            }
        };
    }
    try {
        const playerName = `${rawData.lastName.toUpperCase()}, ${rawData.firstName.toUpperCase()}`;
        // 1. Update the Current Player
        const player = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.update({
            where: {
                id
            },
            data: {
                firstName: rawData.firstName.toUpperCase(),
                lastName: rawData.lastName.toUpperCase(),
                dni: rawData.dni,
                birthDate: new Date(rawData.birthDate),
                tira: rawData.tira,
                scholarship: scholarship,
                federated: federated,
                playsPrimera: playsPrimera,
                email: rawData.email || null,
                phone: rawData.phone || null,
                partnerNumber: rawData.partnerNumber || null,
                contactName: rawData.contactName ? rawData.contactName.toUpperCase() : null,
                shirtNumber: shirtNumber,
                observations: rawData.observations ? rawData.observations.toUpperCase() : null,
                registrationDate: parseDate(rawData.registrationDate),
                withdrawalDate: parseDate(rawData.withdrawalDate),
                siblings: rawData.siblings ? rawData.siblings.toUpperCase() : null,
                category: rawData.category || null,
                status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluatePlayerStatus"])(rawData.status, rawData.dni, rawData.birthDate),
                federationYear: rawData.federationYear ? parseInt(rawData.federationYear) : null,
                federationInstallments: rawData.federationInstallments || null
            }
        });
        // 2. Bidirectional siblings Sync
        // We have siblingIds from the form, which contains IDs of ALL currently selected siblings.
        const siblingIdsStr = formData.get("siblingIds")?.toString();
        const currentSiblingIds = siblingIdsStr ? siblingIdsStr.split(',').filter(Boolean) : [];
        // Update ALL referenced siblings to ensure they have THIS player in their list
        for (const sId of currentSiblingIds){
            const sPlayer = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findUnique({
                where: {
                    id: sId
                }
            });
            if (sPlayer) {
                const sSiblings = sPlayer.siblings ? sPlayer.siblings.split(';').map((s)=>s.trim()) : [];
                // Check if I am in their list
                if (!sSiblings.includes(playerName)) {
                    sSiblings.push(playerName);
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.update({
                        where: {
                            id: sId
                        },
                        data: {
                            siblings: sSiblings.join('; ')
                        }
                    });
                }
            }
        }
        // Note: Removing reference from others when I remove them from my list is harder with just string names storage
        // and without knowing who was there before. We will focus on the "Adding" requirement for now.
        await createAuditLog("UPDATE", "Player", id, rawData);
    } catch (error) {
        console.error("Update Player Error:", error);
        return {
            message: "Error al actualizar: " + error.message,
            errors: undefined
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/players");
    // Get return filters to preserve them
    const returnFilters = formData.get("returnFilters")?.toString();
    const redirectUrl = returnFilters ? `/dashboard/players?${returnFilters}` : '/dashboard/players';
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(redirectUrl);
}
async function searchPlayers(query) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session) return [];
    if (!query || query.length < 2) return [];
    return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findMany({
        where: {
            OR: [
                {
                    firstName: {
                        contains: query
                    }
                },
                {
                    lastName: {
                        contains: query
                    }
                },
                {
                    dni: {
                        contains: query
                    }
                }
            ],
            status: "ACTIVO"
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true
        },
        take: 10,
        orderBy: [
            {
                lastName: 'asc'
            },
            {
                firstName: 'asc'
            }
        ]
    });
}
async function getPlayersByNames(names) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session || !names.length) return [];
    // Names are "LAST, FIRST"
    // We can't easy do a "IN" query because split.
    // We will fetch by "OR".
    const criteria = names.map((n)=>{
        const [last, first] = n.split(',').map((s)=>s.trim());
        if (last && first) return {
            lastName: last,
            firstName: first
        };
        return null;
    }).filter(Boolean);
    if (criteria.length === 0) return [];
    return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findMany({
        where: {
            OR: criteria
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true
        }
    });
}
async function deleteAllPlayers() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (session?.user?.role !== 'ADMIN') return {
        message: "Unauthorized"
    };
    try {
        // Delete related attendance records first due to foreign key constraints if any
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].attendance.deleteMany({});
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.deleteMany({});
        await createAuditLog("DELETE_ALL", "Player", "ALL", {
            count: "ALL"
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/players");
        return {
            message: "Todos los jugadores han sido eliminados correctamente."
        };
    } catch (error) {
        console.error("Delete All Players Error:", error);
        return {
            message: "Error al eliminar jugadores: " + error.message
        };
    }
}
async function dismissAuditIssue(ruleId, identifier) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session) return {
        message: "Unauthorized"
    };
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].dismissedAuditIssue.create({
            data: {
                ruleId,
                identifier,
                reason: "Dismissed by user"
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/administracion/audit");
        return {
            message: "Issue dismissed"
        };
    } catch (error) {
        return {
            message: "Error dismissing issue: " + error.message
        };
    }
}
async function deletePlayer(id, returnFilters) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    const role = session?.user?.role || 'VIEWER';
    if (role !== 'ADMIN' && role !== 'OPERADOR') return {
        message: "No autorizado"
    };
    try {
        // Delete related records
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].attendance.deleteMany({
            where: {
                playerId: id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].payment.deleteMany({
            where: {
                playerId: id
            }
        });
        const player = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.delete({
            where: {
                id
            }
        });
        await createAuditLog("DELETE", "Player", id, {
            name: `${player.lastName}, ${player.firstName}`
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/players");
        // Preserve filters on redirect
        const redirectUrl = returnFilters ? `/dashboard/players?${returnFilters}` : '/dashboard/players';
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(redirectUrl);
    } catch (error) {
        if (error.message === 'NEXT_REDIRECT') throw error;
        console.error("Delete Player Error:", error);
        return {
            message: "Error al eliminar jugador: " + error.message
        };
    }
}
async function validateShirtNumber(playerId, shirtNumber, tira, birthDate, manualCategory) {
    const { getCategory } = await __turbopack_context__.A("[project]/src/lib/utils.ts [app-rsc] (ecmascript, async loader)");
    // 1. Get all category mappings and sort by minYear (youngest to oldest)
    const mappings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].categoryMapping.findMany({
        orderBy: {
            minYear: 'desc'
        }
    });
    // 2. Identify the player's category
    const currentCategory = getCategory({
        birthDate,
        category: manualCategory
    }, mappings);
    // 3. Find adjacent categories
    // mappings are already sorted by minYear desc (youngest to oldest)
    // Actually minYear: desc means 2018, 2016, 2014... (youngest first)
    // Let's reverse find index
    const sortedCats = mappings.map((m)=>m.category);
    const currIdx = sortedCats.indexOf(currentCategory);
    const targetCategories = [
        currentCategory
    ];
    if (currIdx > 0) targetCategories.push(sortedCats[currIdx - 1]); // younger
    if (currIdx !== -1 && currIdx < sortedCats.length - 1) targetCategories.push(sortedCats[currIdx + 1]); // older
    // 4. Check for conflicts
    const conflict = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findFirst({
        where: {
            id: {
                not: playerId || undefined
            },
            tira: tira,
            shirtNumber: shirtNumber,
            OR: [
                {
                    category: {
                        in: targetCategories
                    }
                },
                {
                    category: null
                } // Need to check if their dynamic category matches any target
            ]
        }
    });
    if (conflict) {
        // If conflict.category is null, we must calculate its dynamic category
        if (!conflict.category) {
            const dynamicCat = getCategory(conflict, mappings);
            if (!targetCategories.includes(dynamicCat)) return null;
        }
        return `El número #${shirtNumber} ya está en uso en ${tira} para la categoría ${currentCategory} o adyacentes.`;
    }
    return null;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createAuditLog,
    createPlayer,
    updatePlayer,
    searchPlayers,
    getPlayersByNames,
    deleteAllPlayers,
    dismissAuditIssue,
    deletePlayer
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createAuditLog, "7823e2e29cd5ccd94e134d24941da2d652c6a07dd4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createPlayer, "6051d2edb36988f34aee8495f9a6e06cae88943f6a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updatePlayer, "70469a6e29bd572e07aa54791db2f8050e5cc91c58", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(searchPlayers, "4043ec93fd4e1586978a54aaa3c74c7b68447dbd89", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getPlayersByNames, "40697605e5cedcb89b2e5e98e9ff84bb9dc56bff2a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteAllPlayers, "00c9c8207af3b4e5dd154f76239020976e6ae3761d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(dismissAuditIssue, "603226f502e3e5a984b300dcc33f7dbf9511ee204f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deletePlayer, "60f4256a91c7f83866fc8fba494a8555de3997a8ca", null);
}),
"[project]/src/lib/payment-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"6037dc25af853f7cf241394b6d02360816cbcd415e":"processPaymentExcel","6039d2df14dbe3d599392e781b006af8ae4dcd3002":"savePaymentUpdates","6066e09ec0b362c6828db9e4b851c01eb3d1580de4":"saveFederationPaymentUpdates","60a48ef666870144d809c21f8e9d1dc913605fb33b":"processFederationPaymentExcel"},"",""] */ __turbopack_context__.s([
    "processFederationPaymentExcel",
    ()=>processFederationPaymentExcel,
    "processPaymentExcel",
    ()=>processPaymentExcel,
    "saveFederationPaymentUpdates",
    ()=>saveFederationPaymentUpdates,
    "savePaymentUpdates",
    ()=>savePaymentUpdates
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
function normalizeString(str) {
    return str ? str.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
}
/**
 * Finds a column key in a row using flexible matching:
 * - Exact match (case-insensitive, normalized whitespace)
 * - Partial match (key contains the candidate)
 */ function findColumn(row, candidates) {
    const rowKeys = Object.keys(row);
    // Pass 1: exact match after normalizing whitespace
    for (const candidate of candidates){
        const nc = candidate.trim().toLowerCase().replace(/\s+/g, ' ');
        const found = rowKeys.find((k)=>k.trim().toLowerCase().replace(/[\r\n\s]+/g, ' ') === nc);
        if (found) return found;
    }
    // Pass 2: partial includes
    for (const candidate of candidates){
        const nc = candidate.trim().toLowerCase();
        const found = rowKeys.find((k)=>k.toLowerCase().replace(/[\r\n]+/g, ' ').trim().includes(nc));
        if (found) return found;
    }
    return undefined;
}
async function processPaymentExcel(prevState, formData) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session) {
        return {
            success: false,
            message: "No autorizado",
            stats: {
                total: 0,
                matched: 0,
                unmatched: 0
            },
            results: [],
            logs: [
                "Error: Usuario no autenticado"
            ]
        };
    }
    const file = formData.get('file');
    if (!file) {
        return {
            success: false,
            message: "No se seleccionó archivo",
            stats: {
                total: 0,
                matched: 0,
                unmatched: 0
            },
            results: [],
            logs: [
                "Error: Sin archivo"
            ]
        };
    }
    const logs = [];
    logs.push(`Inicio de procesamiento: ${new Date().toLocaleString()}`);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["read"](buffer, {
            type: 'buffer'
        });
        const sheetName = workbook.SheetNames.find((s)=>s.toLowerCase().includes('basquet')) || workbook.SheetNames[0];
        logs.push(`Leyendo hoja: ${sheetName}`);
        const sheet = workbook.Sheets[sheetName];
        const rawData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(sheet);
        logs.push(`Filas encontradas: ${rawData.length}`);
        if (rawData.length > 0) {
            logs.push(`Columnas detectadas: ${Object.keys(rawData[0]).join(' | ')}`);
        }
        // Fetch ACTIVO + REVISAR players
        const dbPlayers = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findMany({
            where: {
                status: {
                    in: [
                        'ACTIVO',
                        'REVISAR'
                    ]
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dni: true,
                partnerNumber: true,
                tira: true,
                category: true
            }
        });
        logs.push(`Jugadores (ACTIVO + REVISAR) en DB: ${dbPlayers.length}`);
        const results = [];
        let matchedCount = 0;
        for (const [index, row] of rawData.entries()){
            const r = row;
            const rowNum = index + 2;
            const notes = [];
            // Flexible column detection - handles: documento, DNI
            const dniKey = findColumn(r, [
                'documento',
                'dni'
            ]);
            // nrosocio (sin espacio), nro. socio, nro socio
            const socioKey = findColumn(r, [
                'nrosocio',
                'nro. socio',
                'nro socio',
                'socio'
            ]);
            const apellidoKey = findColumn(r, [
                'apellido'
            ]);
            const nombreKey = findColumn(r, [
                'nombre'
            ]);
            // "Ultima cuota social abonada" / "Ultoma cuota Social Abonada"
            const socialKey = findColumn(r, [
                'ultima cuota social abonada',
                'ultima cuota social',
                'cuota social'
            ]);
            const activityKey = findColumn(r, [
                'ultima cuota actividad abonada',
                'ultima cuota actividad',
                'cuota actividad'
            ]);
            const dni = dniKey ? r[dniKey]?.toString().trim() : undefined;
            const socio = socioKey ? r[socioKey]?.toString().trim() : undefined;
            const apellido = apellidoKey ? normalizeString(r[apellidoKey]?.toString()) : '';
            const nombre = nombreKey ? normalizeString(r[nombreKey]?.toString()) : '';
            const lastSocial = socialKey ? r[socialKey]?.toString().trim() : undefined;
            const lastActivity = activityKey ? r[activityKey]?.toString().trim() : undefined;
            let match;
            let method;
            // 1. Try DNI / Documento
            if (dni && dni.length > 4) {
                match = dbPlayers.find((p)=>p.dni === dni);
                if (match) method = 'DNI';
            }
            // 2. Try Nro. Socio
            if (!match && socio) {
                match = dbPlayers.find((p)=>p.partnerNumber === socio);
                if (match) method = 'PARTNER_NUMBER';
            }
            // 3. Try Name Fuzzy (exact clean match)
            if (!match && nombre && apellido) {
                match = dbPlayers.find((p)=>normalizeString(p.firstName) === nombre && normalizeString(p.lastName) === apellido);
                if (match) method = 'NAME_FUZZY';
            }
            const paymentStatus = {
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
    } catch (e) {
        logs.push(`ERROR CRÍTICO: ${e.message}`);
        return {
            success: false,
            message: e.message,
            stats: {
                total: 0,
                matched: 0,
                unmatched: 0
            },
            results: [],
            logs
        };
    }
}
async function savePaymentUpdates(prevState, dataset) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session) return {
        success: false,
        message: "No autorizado"
    };
    const updates = dataset.filter((d)=>d.status === 'MATCHED' && d.player?.id);
    let count = 0;
    try {
        for (const item of updates){
            if (!item.player?.id) continue;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.update({
                where: {
                    id: item.player.id
                },
                data: {
                    lastSocialPayment: item.paymentStatus?.social,
                    lastActivityPayment: item.paymentStatus?.activity
                }
            });
            count++;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAuditLog"])('IMPORT_PAYMENTS', 'Player', 'BATCH', {
            count,
            total: updates.length
        });
        return {
            success: true,
            message: `Se actualizaron los pagos de ${count} jugadores correctamente.`
        };
    } catch (error) {
        return {
            success: false,
            message: "Error al guardar: " + error.message
        };
    }
}
async function processFederationPaymentExcel(prevState, formData) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session) {
        return {
            success: false,
            message: "No autorizado",
            stats: {
                total: 0,
                matched: 0,
                unmatched: 0
            },
            results: [],
            logs: [
                "Error: Usuario no autenticado"
            ]
        };
    }
    const file = formData.get('file');
    if (!file) {
        return {
            success: false,
            message: "No se seleccionó archivo",
            stats: {
                total: 0,
                matched: 0,
                unmatched: 0
            },
            results: [],
            logs: [
                "Error: Sin archivo"
            ]
        };
    }
    const logs = [];
    logs.push(`Inicio de procesamiento: ${new Date().toLocaleString()}`);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["read"](buffer, {
            type: 'buffer'
        });
        const sheetName = workbook.SheetNames[0];
        logs.push(`Leyendo hoja: ${sheetName}`);
        const sheet = workbook.Sheets[sheetName];
        const rawData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(sheet);
        logs.push(`Filas encontradas: ${rawData.length}`);
        if (rawData.length > 0) {
            logs.push(`Columnas detectadas: ${Object.keys(rawData[0]).join(' | ')}`);
        }
        // Fetch ACTIVO + REVISAR players
        const dbPlayers = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findMany({
            where: {
                status: {
                    in: [
                        'ACTIVO',
                        'REVISAR'
                    ]
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dni: true,
                tira: true,
                category: true,
                status: true
            }
        });
        logs.push(`Jugadores (ACTIVO + REVISAR) en DB: ${dbPlayers.length}`);
        const results = [];
        let matchedCount = 0;
        for (const [index, row] of rawData.entries()){
            const r = row;
            const rowNum = index + 2;
            const notes = [];
            const dniKey = findColumn(r, [
                'dni',
                'documento'
            ]);
            const apellidoKey = findColumn(r, [
                'apellido'
            ]);
            const nombreKey = findColumn(r, [
                'nombre'
            ]);
            const yearKey = findColumn(r, [
                'año',
                'anio',
                'year',
                'año pago',
                'año del pago'
            ]);
            const cuotasKey = findColumn(r, [
                'cuotas',
                'cuotas abonadas',
                'cuotas pagadas',
                'installments',
                'estado'
            ]);
            const dni = dniKey ? r[dniKey]?.toString().trim() : undefined;
            const apellido = apellidoKey ? normalizeString(r[apellidoKey]?.toString()) : '';
            const nombre = nombreKey ? normalizeString(r[nombreKey]?.toString()) : '';
            const yearRaw = yearKey ? r[yearKey]?.toString().trim() : undefined;
            const cuotasRaw = cuotasKey ? r[cuotasKey]?.toString().trim().toUpperCase() : undefined;
            const year = yearRaw ? parseInt(yearRaw) : NaN;
            const installments = cuotasRaw || '';
            let match;
            let method;
            if (dni && dni.length > 4) {
                match = dbPlayers.find((p)=>p.dni === dni);
                if (match) method = 'DNI';
            }
            if (!match && nombre && apellido) {
                match = dbPlayers.find((p)=>normalizeString(p.firstName) === nombre && normalizeString(p.lastName) === apellido);
                if (match) method = 'NAME_FUZZY';
            }
            const federationData = !isNaN(year) && installments ? {
                year,
                installments
            } : undefined;
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
                notes.push(`No se pudo encontrar jugador: ${apellido}, ${nombre} (DNI: ${dni})`);
                results.push({
                    status: 'UNMATCHED',
                    originalData: row,
                    federationData,
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
    } catch (e) {
        logs.push(`ERROR CRÍTICO: ${e.message}`);
        return {
            success: false,
            message: e.message,
            stats: {
                total: 0,
                matched: 0,
                unmatched: 0
            },
            results: [],
            logs
        };
    }
}
async function saveFederationPaymentUpdates(prevState, dataset) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session) return {
        success: false,
        message: "No autorizado"
    };
    const updates = dataset.filter((d)=>d.status === 'MATCHED' && d.player?.id && d.federationData);
    let count = 0;
    try {
        for (const item of updates){
            if (!item.player?.id || !item.federationData) continue;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.update({
                where: {
                    id: item.player.id
                },
                data: {
                    federationYear: item.federationData.year,
                    federationInstallments: item.federationData.installments
                }
            });
            count++;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAuditLog"])('IMPORT_FEDERATION_PAYMENTS', 'Player', 'BATCH', {
            count,
            total: updates.length
        });
        return {
            success: true,
            message: `Se actualizó el pago de federación/seguro de ${count} jugadores correctamente.`
        };
    } catch (error) {
        return {
            success: false,
            message: "Error al guardar: " + error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    processPaymentExcel,
    savePaymentUpdates,
    processFederationPaymentExcel,
    saveFederationPaymentUpdates
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(processPaymentExcel, "6037dc25af853f7cf241394b6d02360816cbcd415e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(savePaymentUpdates, "6039d2df14dbe3d599392e781b006af8ae4dcd3002", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(processFederationPaymentExcel, "60a48ef666870144d809c21f8e9d1dc913605fb33b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveFederationPaymentUpdates, "6066e09ec0b362c6828db9e4b851c01eb3d1580de4", null);
}),
"[project]/.next-internal/server/app/dashboard/payments/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/lib/payment-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payment$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/payment-actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/dashboard/payments/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/lib/payment-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00172bdecf9bdacb64dd4c5180e9c8675d7b15d573",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["handleSignOut"],
    "00389c4dee762c9752fa78abeb9062f32a2bc77388",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllRolePermissions"],
    "405b1fff19e2829eba6c9bf3e477254b7973b8a323",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPermissionsForRole"],
    "6028f758cf28d192fd5c86810b2b38b40bb85b5b68",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasPermission"],
    "6037dc25af853f7cf241394b6d02360816cbcd415e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payment$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["processPaymentExcel"],
    "6039d2df14dbe3d599392e781b006af8ae4dcd3002",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payment$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["savePaymentUpdates"],
    "70b175dc5144eb864d129ad1d180d711c56c75c19e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateRolePermission"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$payments$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$dashboard$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$lib$2f$payment$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/dashboard/payments/page/actions.js { ACTIONS_MODULE0 => "[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/lib/payment-actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2d$permission$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/role-permission-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payment$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/payment-actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_c8189d02._.js.map