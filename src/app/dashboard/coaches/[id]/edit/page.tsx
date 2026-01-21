import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCoachForm from "./edit-form";

export default async function EditCoachPage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);

    const coach = await (prisma as any).coach.findUnique({
        where: { id }
    });

    if (!coach) notFound();

    return <EditCoachForm coach={coach} />;
}
