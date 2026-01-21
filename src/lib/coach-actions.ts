'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CoachSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    tira: z.string().optional(),
    category: z.string().optional(),
    active: z.boolean().optional(),
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
        active: formData.get("active") === "on",
    };

    const validatedFields = CoachSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    try {
        await (prisma as any).coach.create({
            data: {
                ...validatedFields.data,
                active: true // Default to active on create
            }
        });
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
        active: formData.get("active") === "on",
    };

    const validatedFields = CoachSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    try {
        await (prisma as any).coach.update({
            where: { id },
            data: validatedFields.data
        });
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
