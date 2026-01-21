import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CoachList from "./coach-list";

export default async function CoachesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const params = await Promise.resolve(searchParams);
    const sort = typeof params?.sort === 'string' ? params.sort : 'name';
    const sortOrder = typeof params?.sortOrder === 'string' ? params.sortOrder : 'asc';

    const coaches = await (prisma as any).coach.findMany({
        orderBy: { [sort]: sortOrder }
    });

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Entrenadores ({coaches.length})</h2>
                <Link href="/dashboard/coaches/create" className="btn btn-primary">
                    + Nuevo Entrenador
                </Link>
            </div>

            <CoachList coaches={coaches} currentSort={sort} currentOrder={sortOrder} />
        </div>
    );
}
