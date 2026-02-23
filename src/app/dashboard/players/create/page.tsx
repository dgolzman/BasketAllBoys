import { prisma } from "@/lib/prisma";
import CreatePlayerForm from "./create-form";

export default async function CreatePlayerPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const searchParams = await props.searchParams;
    const mappings = await (prisma as any).categoryMapping.findMany({ orderBy: { minYear: 'desc' } });
    const categories = mappings.map((m: any) => m.category);

    return <CreatePlayerForm
        categories={categories}
        mappings={mappings}
        initialData={{
            firstName: searchParams.firstName || '',
            lastName: searchParams.lastName || '',
            category: searchParams.category || '',
            tira: searchParams.tira || 'Masculino A',
            returnTo: searchParams.returnTo || ''
        }}
    />;
}
