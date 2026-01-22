import { prisma } from "@/lib/prisma";
import { getCategory } from "@/lib/utils";
import AttendanceSheet from "./attendance-sheet";
import Link from "next/link";

export default async function CategoryAttendancePage({
    params,
    searchParams
}: {
    params: { category: string },
    searchParams: { tira?: string }
}) {
    const { category } = await Promise.resolve(params);
    const { tira } = await Promise.resolve(searchParams);

    const decodedCategory = decodeURIComponent(category);

    const mappings = await prisma.categoryMapping.findMany();
    const isPrimeraCategory = decodedCategory.toLowerCase() === 'primera';
    const isMosquitos = decodedCategory.toLowerCase() === 'mosquitos';

    // Get all active players
    const players = await prisma.player.findMany({
        where: {
            status: 'ACTIVO',
            // Only apply Tira filter if provided and NOT for Mosquitos (which is mixed)
            tira: (tira && tira !== 'Mixed' && tira !== 'Mixto' && !isMosquitos)
                ? (tira === 'A' ? { contains: 'A' } : (tira === 'B' ? { contains: 'B' } : tira))
                : undefined,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });

    // Filter by calculated category AND Tira/Primera logic
    let categoryPlayers = players.filter(p => {
        const cat = getCategory(p, mappings);
        if (isPrimeraCategory) {
            return p.playsPrimera || cat === decodedCategory;
        }
        return cat === decodedCategory;
    });

    // Refine Tira filter in-memory for safety
    if (tira) {
        if (tira === 'Femenino') {
            categoryPlayers = categoryPlayers.filter(p => p.tira === 'Femenino');
        } else if (tira === 'A') {
            categoryPlayers = categoryPlayers.filter(p => p.tira && p.tira.includes('A') && p.tira !== 'Femenino');
        } else if (tira === 'B') {
            categoryPlayers = categoryPlayers.filter(p => p.tira && p.tira.includes('B'));
        }
    }

    // Initial attendance for today (as default)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const initialAttendance = await (prisma as any).attendance.findMany({
        where: {
            date: today,
            playerId: { in: categoryPlayers.map(p => p.id) }
        }
    });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/dashboard/categories" style={{ textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
                <h2 style={{ margin: 0 }}>Tomar Lista: {decodedCategory}</h2>
            </div>

            <AttendanceSheet
                category={decodedCategory}
                players={categoryPlayers}
                initialAttendance={initialAttendance}
            />
        </div>
    );
}
