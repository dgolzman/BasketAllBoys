'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { evaluatePlayerStatus } from "./utils";


const FormSchema = z.object({
    firstName: z.string().min(1, "Nombre es obligatorio"),
    lastName: z.string().min(1, "Apellido es obligatorio"),
    dni: z.string()
        .min(1, "DNI es obligatorio")
        .refine(
            (val) => /^\d{7,12}$/.test(val) || /^TEMP-/.test(val),
            "El DNI debe tener entre 7 y 12 dígitos, o comenzar con TEMP-"
        ),
    birthDate: z.string().min(1, "Fecha de nacimiento es obligatoria"),
    tira: z.string(), // "Femenino", "Masculino A", "Masculino B"
    scholarship: z.boolean().optional(),
    playsPrimera: z.boolean().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().refine(
        (val) => !val || /^\+?\d+$/.test(val),
        "El teléfono debe contener solo números, opcionalmente iniciando con '+"
    ),
    partnerNumber: z.string().optional(),
    contactName: z.string().optional(),
    shirtNumber: z.coerce.number().optional(),
    observations: z.string().optional(),
    registrationDate: z.string().optional(),
    withdrawalDate: z.string().optional(),
    status: z.enum(["ACTIVO", "INACTIVO", "REVISAR"]).default("ACTIVO"),
    siblings: z.string().optional(),
    category: z.string().optional(),
    federationYear: z.coerce.number().optional(),
    federationInstallments: z.string().optional(),
    lastSocialPayment: z.string().optional(),
    lastActivityPayment: z.string().optional(),
});

function sanitizeDNI(dni: any): string {
    if (!dni) return `TEMP-${Date.now()}`;
    const str = String(dni);
    // Preserve TEMP- prefix if already set
    if (str.startsWith('TEMP-')) return str;
    const sanitized = str.replace(/\D/g, "");
    return sanitized.length > 0 ? sanitized : `TEMP-${Date.now()}`;
}

function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


export async function createAuditLog(action: string, entity: string, entityId: string, details?: any) {
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
        // Double check if user exists in DB to avoid FK violations (e.g. after DB reset)
        const userExists = await prisma.user.findUnique({ where: { id: userId } });

        await prisma.auditLog.create({
            data: {
                id: generateId(),
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : null,
                userId: userExists ? userId : null,
            },
        });
    }
}

export async function createPlayer(prevState: any, formData: FormData) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    if (!session || (role !== 'ADMIN' && role !== 'OPERADOR')) {
        return { message: "No tiene permisos para realizar esta acción", errors: undefined };
    }

    const scholarship = formData.get("scholarship") === "on";
    const federated = formData.get("federated") === "on";
    const playsPrimera = formData.get("playsPrimera") === "on";
    const shirtNumberRaw = formData.get("shirtNumber");
    const shirtNumber = (shirtNumberRaw && shirtNumberRaw !== "") ? parseInt(shirtNumberRaw.toString()) : null;

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
        federationInstallments: formData.get("federationInstallments"),
        lastSocialPayment: formData.get("lastSocialPayment"),
        lastActivityPayment: formData.get("lastActivityPayment"),
    };

    const validatedFields = FormSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten());
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Faltan campos obligatorios.",
        };
    }

    const data = validatedFields.data;

    // Shirt Number Validation (0-99, optional, adjacent categories)
    if (shirtNumber !== null) {
        if (shirtNumber < 0 || shirtNumber > 99) {
            return { message: "El número de camiseta debe estar entre 0 y 99.", errors: { shirtNumber: ["Rango inválido"] } };
        }
        const shirtError = await validateShirtNumber(null, shirtNumber, data.tira, data.birthDate, data.category);
        if (shirtError) return { message: shirtError, errors: { shirtNumber: [shirtError] } };
    }

    try {
        const playerName = `${data.lastName.toUpperCase()}, ${data.firstName.toUpperCase()}`;
        const player = await prisma.player.create({
            data: {
                id: generateId(),
                firstName: data.firstName.toUpperCase(),
                lastName: data.lastName.toUpperCase(),
                dni: data.dni,
                birthDate: new Date(data.birthDate), // Ensure valid date
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
                status: evaluatePlayerStatus(data.status, data.dni, data.birthDate),
                federationYear: data.federationYear || null,
                federationInstallments: data.federationInstallments || null,
                lastSocialPayment: data.lastSocialPayment || null,
                lastActivityPayment: data.lastActivityPayment || null,
                updatedAt: new Date(),
            } as any,
        });

        // Bidirectional siblings: Update all chosen siblings to include this new player
        const siblingIds = formData.get("siblingIds")?.toString();
        if (siblingIds) {
            const ids = siblingIds.split(',').filter(Boolean);
            for (const sId of ids) {
                const sPlayer = await prisma.player.findUnique({ where: { id: sId } }) as any;
                if (sPlayer) {
                    const currentSiblings = sPlayer.siblings ? sPlayer.siblings.split(';').map((s: string) => s.trim()) : [];
                    if (!currentSiblings.includes(playerName)) {
                        currentSiblings.push(playerName);
                        await prisma.player.update({
                            where: { id: sId },
                            data: { siblings: currentSiblings.join('; ') }
                        });
                    }
                }
            }
        }

        await createAuditLog("CREATE", "Player", player.id, rawData);
    } catch (error: any) {
        console.error("Create Player Error:", error);
        if (error.code === 'P2002') return { message: "El DNI ya existe." };
        return { message: "Error al crear jugador: " + error.message };
    }

    revalidatePath("/dashboard/players");

    const returnTo = formData.get("returnTo")?.toString();
    if (returnTo) {
        redirect(returnTo);
    } else {
        redirect("/dashboard/players");
    }
}

export type ActionState = {
    message: string;
    errors?: Record<string, string[]>;
};

export async function updatePlayer(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    if (!session || (role !== 'ADMIN' && role !== 'OPERADOR')) {
        return { message: "No tiene permisos para realizar esta acción", errors: undefined };
    }

    const scholarship = formData.get("scholarship") === "on";
    const federated = formData.get("federated") === "on";
    const playsPrimera = formData.get("playsPrimera") === "on";
    const shirtNumberRaw = formData.get("shirtNumber");
    const shirtNumber = (shirtNumberRaw && shirtNumberRaw !== "") ? parseInt(shirtNumberRaw.toString()) : null;

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
        federationInstallments: formData.get("federationInstallments"),
        lastSocialPayment: formData.get("lastSocialPayment"),
        lastActivityPayment: formData.get("lastActivityPayment"),
    };

    // Manual date parsing check to avoid crash
    const parseDate = (d: any) => {
        if (!d) return null;
        const date = new Date(d);
        return isNaN(date.getTime()) ? null : date;
    };

    // Shirt Number Validation
    if (shirtNumber !== null) {
        if (shirtNumber < 0 || shirtNumber > 99) {
            return { message: "El número de camiseta debe estar entre 0 y 99.", errors: { shirtNumber: ["Rango inválido"] } };
        }
        const shirtError = await validateShirtNumber(id, shirtNumber, rawData.tira as string, rawData.birthDate as string, rawData.category as string);
        if (shirtError) return { message: shirtError, errors: { shirtNumber: [shirtError] } };
    }

    try {
        const playerName = `${(rawData.lastName as string).toUpperCase()}, ${(rawData.firstName as string).toUpperCase()}`;

        // 1. Update the Current Player
        const player = await prisma.player.update({
            where: { id },
            data: {
                firstName: (rawData.firstName as string).toUpperCase(),
                lastName: (rawData.lastName as string).toUpperCase(),
                dni: rawData.dni as string,
                birthDate: new Date(rawData.birthDate as string),
                tira: rawData.tira as string,
                scholarship: scholarship,
                federated: federated,
                playsPrimera: playsPrimera,
                email: (rawData.email as string) || null,
                phone: (rawData.phone as string) || null,
                partnerNumber: (rawData.partnerNumber as string) || null,
                contactName: rawData.contactName ? (rawData.contactName as string).toUpperCase() : null,
                shirtNumber: shirtNumber,
                observations: rawData.observations ? (rawData.observations as string).toUpperCase() : null,
                registrationDate: parseDate(rawData.registrationDate),
                withdrawalDate: parseDate(rawData.withdrawalDate),
                siblings: rawData.siblings ? (rawData.siblings as string).toUpperCase() : null,
                category: (rawData.category as string) || null,
                status: evaluatePlayerStatus(rawData.status as string, rawData.dni as string, rawData.birthDate as string),
                federationYear: rawData.federationYear ? parseInt(rawData.federationYear as string) : null,
                federationInstallments: (rawData.federationInstallments as string) || null,
                lastSocialPayment: (rawData.lastSocialPayment as string) || null,
                lastActivityPayment: (rawData.lastActivityPayment as string) || null,
                updatedAt: new Date(),
            } as any
        });

        // 2. Bidirectional siblings Sync
        // We have siblingIds from the form, which contains IDs of ALL currently selected siblings.
        const siblingIdsStr = formData.get("siblingIds")?.toString();
        const currentSiblingIds = siblingIdsStr ? siblingIdsStr.split(',').filter(Boolean) : [];

        // Update ALL referenced siblings to ensure they have THIS player in their list
        for (const sId of currentSiblingIds) {
            const sPlayer = await prisma.player.findUnique({ where: { id: sId } }) as any;
            if (sPlayer) {
                const sSiblings = sPlayer.siblings ? sPlayer.siblings.split(';').map((s: string) => s.trim()) : [];
                // Check if I am in their list
                if (!sSiblings.includes(playerName)) {
                    sSiblings.push(playerName);
                    await prisma.player.update({
                        where: { id: sId },
                        data: { siblings: sSiblings.join('; ') }
                    });
                }
            }
        }

        // Note: Removing reference from others when I remove them from my list is harder with just string names storage
        // and without knowing who was there before. We will focus on the "Adding" requirement for now.

        await createAuditLog("UPDATE", "Player", id, rawData);
    } catch (error: any) {
        console.error("Update Player Error:", error);
        return { message: "Error al actualizar: " + error.message, errors: undefined };
    }

    revalidatePath("/dashboard/players");

    // Get return filters to preserve them
    const returnFilters = formData.get("returnFilters")?.toString();
    const redirectUrl = returnFilters ? `/dashboard/players?${returnFilters}` : '/dashboard/players';
    redirect(redirectUrl);
}

export async function searchPlayers(query: string) {
    const session = await auth();
    if (!session) return [];

    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toUpperCase();

    return await prisma.player.findMany({
        where: {
            OR: [
                { firstName: { contains: normalizedQuery } },
                { lastName: { contains: normalizedQuery } },
                { dni: { contains: normalizedQuery } },
            ],
            status: "ACTIVO"
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
        },
        take: 10,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });
}

export async function getPlayersByNames(names: string[]) {
    const session = await auth();
    if (!session || !names.length) return [];

    // Names are "LAST, FIRST"
    // We can't easy do a "IN" query because split.
    // We will fetch by "OR".
    const criteria = names.map(n => {
        const [last, first] = n.split(',').map(s => s.trim());
        if (last && first) return { lastName: last, firstName: first };
        return null;
    }).filter(Boolean) as { lastName: string, firstName: string }[];

    if (criteria.length === 0) return [];

    return await prisma.player.findMany({
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

export async function assignPlayerToTeam(playerId: string, category: string, tira: string) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    if (!session || (role !== 'ADMIN' && role !== 'OPERADOR')) {
        return { message: "No autorizado" };
    }

    try {
        await prisma.player.update({
            where: { id: playerId },
            data: { category, tira }
        });

        await createAuditLog("UPDATE", "Player", playerId, { action: "Assigned to team", category, tira });
        revalidatePath("/dashboard/categories");
        return { success: true };
    } catch (error: any) {
        console.error("Assign Player Error:", error);
        return { message: "Error al asignar jugador: " + error.message };
    }
}

export async function linkSiblings(playerIds: string[]) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    if (!session || (role !== 'ADMIN' && role !== 'OPERADOR')) {
        return { message: "No autorizado" };
    }

    try {
        const players = await prisma.player.findMany({
            where: { id: { in: playerIds } }
        });

        for (const p of players) {
            const currentSiblings = p.siblings ? p.siblings.split(';').map(s => s.trim()) : [];
            const newSiblings = new Set(currentSiblings);

            // Add all other players in the group to this player's siblings list
            players.forEach(other => {
                if (other.id !== p.id) {
                    newSiblings.add(`${other.lastName}, ${other.firstName}`);
                }
            });

            const updatedSiblings = Array.from(newSiblings).join('; ');
            await prisma.player.update({
                where: { id: p.id },
                data: { siblings: updatedSiblings }
            });
            await createAuditLog("UPDATE", "Player", p.id, { action: "Linked Sibling", siblings: updatedSiblings });
        }
        revalidatePath("/dashboard/administracion/siblings");
        revalidatePath("/dashboard/players");
        return { success: true };
    } catch (error: any) {
        console.error("Link Siblings Error:", error);
        return { message: "Error al vincular hermanos: " + error.message };
    }
}

export async function saveActivityFee(formData: FormData) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    if (!session || (role !== 'ADMIN' && role !== 'OPERADOR')) {
        return { message: "No autorizado" };
    }

    const year = parseInt(formData.get("year") as string);
    const month = parseInt(formData.get("month") as string);
    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);

    if (isNaN(year) || isNaN(month) || !category || isNaN(amount)) {
        return { message: "Faltan campos obligatorios o son incorrectos" };
    }

    try {
        await prisma.activityFee.upsert({
            where: {
                year_month_category: { year, month, category }
            },
            update: { amount },
            create: { year, month, category, amount }
        });

        await createAuditLog("CREATE/UPDATE", "ActivityFee", "FEE", { year, month, category, amount });
        revalidatePath("/dashboard/administracion/fees");
        return { success: true };
    } catch (error: any) {
        console.error("Save Fee Error:", error);
        return { message: "Error al guardar cuota: " + error.message };
    }
}

export async function deleteActivityFee(id: string) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    if (role !== 'ADMIN') return { message: "No autorizado" };

    try {
        await prisma.activityFee.delete({ where: { id } });
        await createAuditLog("DELETE", "ActivityFee", id);
        revalidatePath("/dashboard/administracion/fees");
        return { success: true };
    } catch (error: any) {
        return { message: "Error al eliminar cuota: " + error.message };
    }
}

export async function deleteAllPlayers() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "Unauthorized" };

    try {
        // Delete related attendance records first due to foreign key constraints if any
        await (prisma as any).attendance.deleteMany({});
        await prisma.player.deleteMany({});

        await createAuditLog("DELETE_ALL", "Player", "ALL", { count: "ALL" });

        revalidatePath("/dashboard/players");
        return { message: "Todos los jugadores han sido eliminados correctamente." };
    } catch (error: any) {
        console.error("Delete All Players Error:", error);
        return { message: "Error al eliminar jugadores: " + error.message };
    }
}


export async function dismissAuditIssue(ruleId: string, identifier: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.dismissedAuditIssue.create({
            data: {
                id: generateId(),
                ruleId,
                identifier,
                reason: "Dismissed by user"
            }
        });
        revalidatePath("/dashboard/administracion/audit");
        return { message: "Issue dismissed" };
    } catch (error: any) {
        return { message: "Error dismissing issue: " + error.message };
    }
}
export async function deletePlayer(id: string, returnFilters?: string) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    if (role !== 'ADMIN' && role !== 'OPERADOR') return { message: "No autorizado" };

    try {
        // Delete related records
        await (prisma as any).attendance.deleteMany({ where: { playerId: id } });
        await (prisma as any).payment.deleteMany({ where: { playerId: id } });

        const player = await prisma.player.delete({ where: { id } });

        await createAuditLog("DELETE", "Player", id, { name: `${player.lastName}, ${player.firstName}` });

        revalidatePath("/dashboard/players");

        // Preserve filters on redirect
        const redirectUrl = returnFilters ? `/dashboard/players?${returnFilters}` : '/dashboard/players';
        redirect(redirectUrl);
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') throw error;
        console.error("Delete Player Error:", error);
        return { message: "Error al eliminar jugador: " + error.message };
    }
}

async function validateShirtNumber(playerId: string | null, shirtNumber: number, tira: string, birthDate: string, manualCategory?: string) {
    const { getCategory } = await import("@/lib/utils");

    // 1. Get all category mappings and sort by minYear (youngest to oldest)
    const mappings = await (prisma as any).categoryMapping.findMany({ orderBy: { minYear: 'desc' } });

    // 2. Identify the player's category
    const currentCategory = getCategory({ birthDate, category: manualCategory }, mappings);

    // 3. Find adjacent categories
    // mappings are already sorted by minYear desc (youngest to oldest)
    // Actually minYear: desc means 2018, 2016, 2014... (youngest first)
    // Let's reverse find index
    const sortedCats = mappings.map((m: any) => m.category);
    const currIdx = sortedCats.indexOf(currentCategory);

    const targetCategories = [currentCategory];
    if (currIdx > 0) targetCategories.push(sortedCats[currIdx - 1]); // younger
    if (currIdx !== -1 && currIdx < sortedCats.length - 1) targetCategories.push(sortedCats[currIdx + 1]); // older

    // 4. Check for conflicts
    const conflict = await prisma.player.findFirst({
        where: {
            id: { not: playerId || undefined },
            tira: tira,
            shirtNumber: shirtNumber,
            OR: [
                { category: { in: targetCategories } }, // Manual match
                { category: null } // Need to check if their dynamic category matches any target
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

