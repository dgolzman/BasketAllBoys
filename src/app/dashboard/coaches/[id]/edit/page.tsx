import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCoachForm from "./edit-form";

export default async function EditCoachPage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);

    const coach = await (prisma as any).coach.findUnique({
        where: { id }
    });

    if (!coach) notFound();

    const mappings = await (prisma as any).categoryMapping.findMany();
    const categories = mappings.map((m: any) => m.category);

    return <EditCoachForm coach={coach} categories={categories} />;
}
