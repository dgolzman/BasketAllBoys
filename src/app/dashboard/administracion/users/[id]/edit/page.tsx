import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditUserForm from "./edit-form";

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);

    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) notFound();

    return <EditUserForm user={user} />;
}
