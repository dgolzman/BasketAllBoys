import { prisma } from "@/lib/prisma";
import CreatePlayerForm from "./create-form";

export default async function CreatePlayerPage() {
    const mappings = await (prisma as any).categoryMapping.findMany({ orderBy: { minYear: 'desc' } });
    const categories = mappings.map((m: any) => m.category);

    return <CreatePlayerForm categories={categories} />;
}
