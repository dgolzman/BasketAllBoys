import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditCoachForm from "./edit-form";

export default async function EditCoachPage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);

    const coach = await (prisma as any).coach.findUnique({
        where: { id }
    });

    if (!coach) notFound();

    const mappings = await (prisma as any).categoryMapping.findMany();
    const categories = mappings.map((m: any) => m.category);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Link
                href="/dashboard/coaches"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontWeight: 500
                }}
            >
                ← Volver a la lista
            </Link>
            <EditCoachForm coach={coach} categories={categories} />
        </div>
    );
}
