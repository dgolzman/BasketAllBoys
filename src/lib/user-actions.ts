'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";

const UserSchema = z.object({
    name: z.string().min(1, "Nombre es obligatorio"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    role: z.enum(["ADMIN", "SUB_COMISION", "COORDINADOR", "ENTRENADOR"]),
});

function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


export async function createUser(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "No autorizado" };

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
    };

    const validatedFields = UserSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    const { name, email, password, role } = validatedFields.data;

    try {
        if (!password) return { message: "La contraseña es obligatoria para nuevos usuarios" };

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                id: generateId(),
                name,
                email,
                password: hashedPassword,
                role,
                updatedAt: new Date(),
            },
        });
    } catch (error: any) {
        if (error.code === 'P2002') return { message: "El email ya está en uso" };
        return { message: "Error al crear usuario: " + error.message };
    }

    revalidatePath("/dashboard/administracion/users");
    redirect("/dashboard/administracion/users");
}

export async function updateUser(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "No autorizado" };

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
    };

    const validatedFields = UserSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    const { name, email, password, role } = validatedFields.data;

    try {
        const updateData: any = { name, email, role };
        if (password && password.length > 0) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id },
            data: updateData,
        });
    } catch (error: any) {
        return { message: "Error al actualizar usuario: " + error.message };
    }

    revalidatePath("/dashboard/administracion/users");
    redirect("/dashboard/administracion/users");
}

export async function deleteUser(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "No autorizado" };

    // Prevent self-deletion
    if (session.user.id === id) return { message: "No puedes eliminar tu propio usuario" };

    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath("/dashboard/administracion/users");
        return { message: "Usuario eliminado correctamente" };
    } catch (error: any) {
        return { message: "Error al eliminar usuario: " + error.message };
    }
}
