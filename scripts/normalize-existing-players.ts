import { PrismaClient } from '@prisma/client';
import path from 'path';

// Local development database path
const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${dbPath}`
        }
    }
});

function normalizeString(str: string | null | undefined): string {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

async function main() {
    console.log("🚀 Starting player name normalization...");

    const players = await prisma.player.findMany();
    console.log(`Found ${players.length} players to check.`);

    let updatedCount = 0;

    for (const player of players) {
        const normalizedFirstName = normalizeString(player.firstName);
        const normalizedLastName = normalizeString(player.lastName);
        const normalizedContact = player.contactName ? normalizeString(player.contactName) : null;
        const normalizedObs = player.observations ? normalizeString(player.observations) : null;
        const normalizedSiblings = player.siblings ? normalizeString(player.siblings) : null;

        const needsUpdate =
            normalizedFirstName !== player.firstName ||
            normalizedLastName !== player.lastName ||
            normalizedContact !== player.contactName ||
            normalizedObs !== player.observations ||
            normalizedSiblings !== player.siblings;

        if (needsUpdate) {
            await prisma.player.update({
                where: { id: player.id },
                data: {
                    firstName: normalizedFirstName,
                    lastName: normalizedLastName,
                    contactName: normalizedContact,
                    observations: normalizedObs,
                    siblings: normalizedSiblings,
                    updatedAt: new Date()
                }
            });
            updatedCount++;
            if (updatedCount % 50 === 0) {
                console.log(`...processed ${updatedCount} updates`);
            }
        }
    }

    console.log(`✅ Normalization complete! ${updatedCount} players were updated.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
