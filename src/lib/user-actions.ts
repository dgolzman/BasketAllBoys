'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createAuditLog } from "./actions";

const passwordRegex = /^.{6,}$/;

const UserSchema = z.object({
    name: z.string().min(1, "Nombre es obligatorio"),
    email: z.string().email("Email inválido"),
    password: z.string().optional().or(z.literal("")).superRefine((val, ctx) => {
        if (val && val.length > 0) {
            if (!passwordRegex.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Mínimo 6 caracteres",
                });
            }
        }
    }),
    role: z.enum(["ADMIN", "SUB_COMISION", "COORDINADOR", "ENTRENADOR"]),
    forcePasswordChange: z.boolean().default(true),
});

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Password actual requerida"),
    newPassword: z.string().superRefine((val, ctx) => {
        if (!passwordRegex.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Mínimo 6 caracteres",
            });
        }
    }),
    confirmPassword: z.string().min(1, "Confirme su password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
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
        forcePasswordChange: formData.get("forcePasswordChange") === "on",
    };

    const validatedFields = UserSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    const { name, email, password, role, forcePasswordChange } = validatedFields.data;

    try {
        if (!password) return { message: "La contraseña es obligatoria para nuevos usuarios" };

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                id: generateId(),
                name,
                email,
                password: hashedPassword,
                role,
                forcePasswordChange, // Usar valor dinámico del formulario
                updatedAt: new Date(),
            },
        });
        await createAuditLog("CREATE", "User", newUser.id, { name, email, role });
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
        forcePasswordChange: formData.get("forcePasswordChange") === "on",
    };

    const validatedFields = UserSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    const { name, email, password, role, forcePasswordChange } = validatedFields.data;

    try {
        const updateData: any = {
            name,
            email,
            role,
            forcePasswordChange
        };

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

    try {
        const userToDelete = await prisma.user.findUnique({ where: { id } });
        if (userToDelete?.email === 'admin@allboys.com') {
            return { message: "No se puede eliminar el usuario administrador original" };
        }

        // Prevent self-deletion
        if (session.user.id === id) return { message: "No puedes eliminar tu propio usuario" };

        await prisma.user.delete({ where: { id } });
        await createAuditLog("DELETE", "User", id, { email: userToDelete?.email });
        revalidatePath("/dashboard/administracion/users");
        return { message: "Usuario eliminado correctamente" };
    } catch (error: any) {
        return { message: "Error al eliminar usuario: " + error.message };
    }
}

export async function updatePassword(prevState: any, formData: FormData) {
    const session = await auth() as any;
    if (!session?.user) return { message: "No autenticado" };

    const rawData = {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    };

    const validatedFields = ChangePasswordSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación",
        };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    try {
        const user = await (prisma as any).user.findUnique({ where: { id: session.user.id } });
        if (!user || !user.password) return { message: "Usuario no encontrado o sin contraseña local" };

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return { message: "La contraseña actual es incorrecta", errors: { currentPassword: ["Password incorrecta"] } };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                forcePasswordChange: false,
                updatedAt: new Date(),
            },
        });

        // Revalidate to update session in middleware
        revalidatePath("/");

    } catch (error: any) {
        return { message: "Error al cambiar contraseña: " + error.message };
    }

    redirect("/dashboard");
}
