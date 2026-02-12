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

// Helper to handle empty strings from forms as undefined/null
const emptyToUndefined = z.preprocess((val) => (val === "" ? undefined : val), z.string().optional());
const emptyToNull = z.preprocess((val) => (val === "" ? null : val), z.string().nullable().optional());

const CoachSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    dni: emptyToNull,
    birthDate: emptyToUndefined,
    observations: emptyToUndefined,
    email: z.preprocess((val) => (val === "" ? undefined : val), z.string().email("Email inválido").optional()),
    phone: emptyToUndefined,
    tira: emptyToUndefined,
    category: emptyToUndefined,
    role: emptyToUndefined,
    status: z.enum(["ACTIVO", "INACTIVO", "REVISAR"]).default("ACTIVO"),
    salary: z.coerce.number().optional(),
    registrationDate: emptyToUndefined,
    withdrawalDate: emptyToUndefined,
});

export async function createCoach(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "No autorizado" };

    const rawData = {
        name: formData.get("name"),
        dni: formData.get("dni"),
        birthDate: formData.get("birthDate"),
        observations: formData.get("observations"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        tira: formData.getAll("tira").join(", "),
        category: formData.getAll("category").join(", "),
        role: formData.get("role"),
        status: formData.get("status") || "ACTIVO",
        salary: formData.get("salary") || 0,
        registrationDate: formData.get("registrationDate"),
        withdrawalDate: formData.get("withdrawalDate"),
    };

    const validatedFields = CoachSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
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
        const birthDate = data.birthDate ? new Date(data.birthDate + "T12:00:00") : null;

        const coach = await (prisma as any).coach.create({
            data: {
                ...data,
                dni: data.dni || null,
                birthDate: birthDate,
                registrationDate: regDate,
                withdrawalDate: widthDate,
                status: data.status || "ACTIVO",
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
        dni: formData.get("dni"),
        birthDate: formData.get("birthDate"),
        observations: formData.get("observations"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        tira: formData.getAll("tira").join(", "),
        category: formData.getAll("category").join(", "),
        role: formData.get("role"),
        status: formData.get("status") || "ACTIVO",
        salary: formData.get("salary") || 0,
        registrationDate: formData.get("registrationDate"),
        withdrawalDate: formData.get("withdrawalDate"),
    };

    const validatedFields = CoachSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
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
        const birthDate = data.birthDate ? new Date(data.birthDate + "T12:00:00") : null;

        await (prisma as any).coach.update({
            where: { id },
            data: {
                ...data,
                dni: data.dni || null,
                birthDate: birthDate,
                registrationDate: regDate,
                withdrawalDate: widthDate,
            }
        });

        // Track salary history if changed
        if (oldCoach && data.salary !== undefined && data.salary !== oldCoach.salary) {
            await (prisma as any).salaryHistory.create({
                data: {
                    amount: data.salary,
                    coachId: id,
                    date: regDate || new Date()
                }
            });
        }

        // SPECIAL FIX: Force update ALL salary history dates to match registration date
        // This addresses existing bad data where salary date < registration date (e.g. timezone errors)
        if (regDate) {
            await (prisma as any).salaryHistory.updateMany({
                where: { coachId: id },
                data: { date: regDate }
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
