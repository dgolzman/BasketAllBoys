import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DRY_RUN is false because we want this to run during update
const DRY_RUN = false;

async function main() {
    console.log(`🚀 Iniciando migración de estado SALDADO (DRY_RUN: ${DRY_RUN}) ---`);

    const players = await prisma.player.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
            birthDate: true,
            federationInstallments: true,
        }
    });

    let updatedCount = 0;

    for (const player of players) {
        let installments = player.federationInstallments || '';
        if (installments === '-' || !installments) continue;

        // Si ya está saldado, ignorar
        if (installments.toUpperCase() === 'SALDADO') continue;

        const category = (player.category || '').toLowerCase();
        const birthYear = player.birthDate ? new Date(player.birthDate).getFullYear() : null;

        // Lógica: Mosquitos, Pre-Mini, Mini son 1 cuota
        // Si cat es null, usamos el año de nacimiento (2015 en adelante son Mini o menores)
        const isYouth = category.includes('mosquitos') ||
            category.includes('u9') ||
            category.includes('u11') ||
            category.includes('pre-mini') ||
            category.includes('mini') ||
            (birthYear && birthYear >= 2015);

        const instMatch = installments.match(/\d+/);
        const instNum = instMatch ? parseInt(instMatch[0]) : 0;

        let shouldBeSaldado = false;
        if (isYouth && instNum >= 1) {
            shouldBeSaldado = true;
        } else if (!isYouth && instNum >= 3) {
            shouldBeSaldado = true;
        }

        if (shouldBeSaldado) {
            console.log(`[${DRY_RUN ? 'PREVIEW' : 'ACTUALIZANDO'}] [${player.lastName}, ${player.firstName}] (Cat: ${player.category || 'N/A'}, Año: ${birthYear || 'N/A'}): ${installments} -> SALDADO`);

            if (!DRY_RUN) {
                await prisma.player.update({
                    where: { id: player.id },
                    data: { federationInstallments: 'SALDADO' }
                });
            }
            updatedCount++;
        }
    }

    console.log(`✅ Migración finalizada. Se ${DRY_RUN ? 'previsualizaron' : 'actualizaron'} ${updatedCount} jugadores. ---`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
