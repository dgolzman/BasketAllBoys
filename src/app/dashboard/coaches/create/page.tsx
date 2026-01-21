import { getCategoryMappings } from "@/lib/admin-actions";
import CreateCoachForm from "./create-form";

export default async function CreateCoachPage() {
    const mappings = await getCategoryMappings();
    const categories = mappings.map((m: any) => m.category);

    return <CreateCoachForm categories={categories} />;
}
