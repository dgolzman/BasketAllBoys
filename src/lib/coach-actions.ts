'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function createAuditLog(action: string, entity: string, entityId: string, details?: any) {
    const session = await auth();
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

const CoachSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    tira: z.string().optional(),
    category: z.string().optional(),
    role: z.string().optional(),
    active: z.boolean().optional(),
    salary: z.coerce.number().optional(),
    registrationDate: z.string().optional(),
    withdrawalDate: z.string().optional(),
});

export async function createCoach(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "No autorizado" };

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        tira: formData.getAll("tira").join(", "),
        category: formData.getAll("category").join(", "),
        role: formData.get("role"),
        active: formData.get("active") === "on",
        salary: formData.get("salary") || 0,
        registrationDate: formData.get("registrationDate"),
        withdrawalDate: formData.get("withdrawalDate"),
    };

    const validatedFields = CoachSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    try {
        const data = validatedFields.data;

        // Fix timezone issue by appending time, ensuring it falls on the correct day in local time
        const regDate = data.registrationDate ? new Date(data.registrationDate + "T12:00:00") : null;
        const widthDate = data.withdrawalDate ? new Date(data.withdrawalDate + "T12:00:00") : null;

        const coach = await (prisma as any).coach.create({
            data: {
                ...data,
                registrationDate: regDate,
                withdrawalDate: widthDate,
                active: true,
                salaryHistory: data.salary ? {
                    create: {
                        amount: data.salary,
                        date: regDate || new Date()
                    }
                } : undefined
            }
        });

        await createAuditLog("CREATE", "Coach", coach.id, rawData);
    } catch (error: any) {
        return { message: "Error al crear entrenador: " + error.message };
    }

    revalidatePath("/dashboard/coaches");
    redirect("/dashboard/coaches");
}

export async function updateCoach(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "No autorizado" };

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        tira: formData.getAll("tira").join(", "),
        category: formData.getAll("category").join(", "),
        role: formData.get("role"),
        active: formData.get("active") === "on",
        salary: formData.get("salary") || 0,
        registrationDate: formData.get("registrationDate"),
        withdrawalDate: formData.get("withdrawalDate"),
    };

    const validatedFields = CoachSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    try {
        const data = validatedFields.data;
        const oldCoach = await (prisma as any).coach.findUnique({ where: { id } });

        // Fix timezone issue
        const regDate = data.registrationDate ? new Date(data.registrationDate + "T12:00:00") : null;
        const widthDate = data.withdrawalDate ? new Date(data.withdrawalDate + "T12:00:00") : null;

        await (prisma as any).coach.update({
            where: { id },
            data: {
                ...data,
                registrationDate: regDate,
                withdrawalDate: widthDate,
            }
        });

        // Track salary history if changed
        if (oldCoach && data.salary !== undefined && data.salary !== oldCoach.salary) {
            await (prisma as any).salaryHistory.create({
                data: {
                    amount: data.salary,
                    coachId: id
                }
            });
        }

        await createAuditLog("UPDATE", "Coach", id, rawData);
    } catch (error: any) {
        return { message: "Error al actualizar entrenador: " + error.message };
    }

    revalidatePath("/dashboard/coaches");
    redirect("/dashboard/coaches");
}

export async function deleteCoach(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "No autorizado" };

    try {
        await (prisma as any).coach.delete({ where: { id } });
        revalidatePath("/dashboard/coaches");
        return { message: "Entrenador eliminado correctamente" };
    } catch (error: any) {
        return { message: "Error al eliminar entrenador: " + error.message };
    }
}
