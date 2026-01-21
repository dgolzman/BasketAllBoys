'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveAttendance(date: Date, attendanceData: Record<string, boolean>) {
    // Normalize date to local midnight to avoid timezone shifts
    const normalizedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    normalizedDate.setHours(0, 0, 0, 0);

    const records = Object.entries(attendanceData).map(([playerId, present]) => ({
        playerId,
        date: normalizedDate,
        present,
    }));

    try {
        for (const record of records) {
            await prisma.attendance.upsert({
                where: {
                    playerId_date: {
                        playerId: record.playerId,
                        date: record.date,
                    }
                },
                update: {
                    present: record.present,
                },
                create: {
                    playerId: record.playerId,
                    date: record.date,
                    present: record.present,
                },
            });
        }
        revalidatePath("/dashboard/categories");
        revalidatePath("/dashboard/reports");
        return { success: true, message: "Asistencia guardada correctamente" };
    } catch (error: any) {
        return { success: false, message: "Error al guardar asistencia: " + error.message };
    }
}

export async function getAttendanceByDateAndPlayers(date: Date, playerIds: string[]) {
    const normalizedDate = new Date(date.setHours(0, 0, 0, 0));
    const attendance = await prisma.attendance.findMany({
        where: {
            date: normalizedDate,
            playerId: { in: playerIds }
        }
    });
    return attendance;
}
