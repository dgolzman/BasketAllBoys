import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/role-permission-actions";
import { PERMISSIONS } from "@/lib/roles";
import PaymentImporter from "@/components/payment-importer";

export default async function PaymentsPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';

    const canAccess = await hasPermission(role, PERMISSIONS.VIEW_PAYMENTS);
    if (!canAccess) {
        redirect('/dashboard');
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Control de Pagos</h2>
            </div>

            <PaymentImporter />

            <div className="mt-8 text-sm text-gray-500">
                <p>Nota: Este módulo permite subir el reporte de Administración y cruzarlo con la base de datos de jugadores activos.</p>
            </div>
        </div>
    );
}
