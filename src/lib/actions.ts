'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const FormSchema = z.object({
    firstName: z.string().min(1, "Nombre es obligatorio"),
    lastName: z.string().min(1, "Apellido es obligatorio"),
    dni: z.string()
        .min(1, "DNI es obligatorio")
        .min(1, "DNI es obligatorio")
        // Allow dots and numbers
        .min(7, "DNI demasiado corto")
        .max(12, "DNI demasiado largo"),
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
    active: z.boolean().optional(),
    siblings: z.string().optional(),
    category: z.string().optional(),
});

function sanitizeDNI(dni: any): string {
    if (!dni) return "11111111";
    return String(dni).trim();
}

async function createAuditLog(action: string, entity: string, entityId: string, details?: any) {
    const session = await auth();
    // Use session user id if available
    if (session?.user?.id) {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : null,
                userId: session.user.id,
            },
        });
    }
}

export async function createPlayer(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const scholarship = formData.get("scholarship") === "on";
    const playsPrimera = formData.get("playsPrimera") === "on";

    const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        dni: sanitizeDNI(formData.get("dni")),
        birthDate: formData.get("birthDate"),
        tira: formData.get("tira"),
        scholarship: scholarship,
        playsPrimera: playsPrimera,
        email: formData.get("email"),
        phone: formData.get("phone"),
        // Extras
        partnerNumber: formData.get("partnerNumber"),
        contactName: formData.get("contactName"),
        shirtNumber: formData.get("shirtNumber"),
        observations: formData.get("observations"),
        registrationDate: formData.get("registrationDate"),
        siblings: formData.get("siblings"),
        category: formData.get("category"),
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

    try {
        const playerName = `${data.lastName.toUpperCase()}, ${data.firstName.toUpperCase()}`;
        const player = await prisma.player.create({
            data: {
                firstName: data.firstName.toUpperCase(),
                lastName: data.lastName.toUpperCase(),
                dni: data.dni,
                birthDate: new Date(data.birthDate), // Ensure valid date
                tira: data.tira,
                scholarship: scholarship,
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
                active: true,
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
    redirect("/dashboard/players");
}

export type ActionState = {
    message: string;
    errors?: Record<string, string[]>;
};

export async function updatePlayer(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await auth();
    if (!session) return { message: "Unauthorized", errors: undefined };

    const scholarship = formData.get("scholarship") === "on";
    const playsPrimera = formData.get("playsPrimera") === "on";
    const active = formData.get("active") === "on";

    const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        dni: sanitizeDNI(formData.get("dni")),
        birthDate: formData.get("birthDate"),
        tira: formData.get("tira"),
        scholarship: scholarship,
        playsPrimera: playsPrimera,
        email: formData.get("email"),
        phone: formData.get("phone"),
        active: active,
        partnerNumber: formData.get("partnerNumber"),
        contactName: formData.get("contactName"),
        shirtNumber: formData.get("shirtNumber"),
        observations: formData.get("observations"),
        registrationDate: formData.get("registrationDate"),
        withdrawalDate: formData.get("withdrawalDate"),
        siblings: formData.get("siblings"),
        category: formData.get("category")
    };

    // Manual date parsing check to avoid crash
    const parseDate = (d: any) => {
        if (!d) return null;
        const date = new Date(d);
        return isNaN(date.getTime()) ? null : date;
    };

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
                playsPrimera: playsPrimera,
                email: (rawData.email as string) || null,
                phone: (rawData.phone as string) || null,
                active: active,
                partnerNumber: (rawData.partnerNumber as string) || null,
                contactName: rawData.contactName ? (rawData.contactName as string).toUpperCase() : null,
                shirtNumber: rawData.shirtNumber ? parseInt(rawData.shirtNumber as string) : null,
                observations: rawData.observations ? (rawData.observations as string).toUpperCase() : null,
                registrationDate: parseDate(rawData.registrationDate),
                withdrawalDate: parseDate(rawData.withdrawalDate),
                siblings: rawData.siblings ? (rawData.siblings as string).toUpperCase() : null,
                category: (rawData.category as string) || null,
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
    redirect("/dashboard/players");
}

export async function searchPlayers(query: string) {
    const session = await auth();
    if (!session) return [];

    if (!query || query.length < 2) return [];

    return await prisma.player.findMany({
        where: {
            OR: [
                { firstName: { contains: query } },
                { lastName: { contains: query } },
                { dni: { contains: query } },
            ],
            active: true
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
