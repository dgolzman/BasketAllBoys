import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageGuide from "@/components/ui/page-guide";
import CoachList from "./coach-list";
import ExportCoachesButton from "./export-button";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/role-permission-actions";
import { PERMISSIONS } from "@/lib/roles";

export default async function CoachesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';
    const canEditCoaches = await hasPermission(role, PERMISSIONS.EDIT_COACHES);
    const canSeeSalary = await hasPermission(role, PERMISSIONS.VIEW_COACH_SALARY);
    const params = await searchParams;
    const sort = typeof params?.sort === 'string' ? params.sort : 'name';
    const sortOrder = typeof params?.sortOrder === 'string' ? params.sortOrder : 'asc';

    const coaches = await (prisma as any).coach.findMany({
        orderBy: { [sort]: sortOrder }
    });

    const coachesSerialized = coaches.map((c: any) => ({
        ...c,
        birthDate: c.birthDate ? c.birthDate.toISOString().split('T')[0] : '',
        registrationDate: c.registrationDate ? c.registrationDate.toISOString().split('T')[0] : '',
        withdrawalDate: c.withdrawalDate ? c.withdrawalDate.toISOString().split('T')[0] : '',
        salary: c.salary ? c.salary.toString() : '',
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
    }));

    return (
        <div>
            <PageGuide guideId="coaches">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>🧢 Gestión del Staff</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Administra a los entrenadores y sus asignaciones.
                            Es fundamental mantener actualizada la <strong>Fecha de Alta</strong> y el <strong>Monto Salarial</strong> para que los informes financieros sean precisos.
                        </p>
                    </div>
                </div>
            </PageGuide>

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>Entrenadores ({coaches.length})</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ExportCoachesButton coaches={coachesSerialized} />
                    {canEditCoaches && (
                        <Link href="/dashboard/coaches/create" className="btn btn-primary">
                            + Nuevo Entrenador
                        </Link>
                    )}
                </div>
            </div>

            <CoachList coaches={coaches} currentSort={sort} currentOrder={sortOrder} role={role} canSeeSalary={canSeeSalary} />
        </div>
    );
}
