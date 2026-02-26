const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function checkDb(dbPath) {
    console.log(`Checking ${dbPath}...`);
    if (!fs.existsSync(dbPath)) {
        console.log("  File does not exist.");
        return;
    }

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: `file:${path.resolve(dbPath)}`
            }
        }
    });

    try {
        const count = await prisma.player.count();
        console.log(`  Found ${count} players.`);
        if (count > 0) {
            const one = await prisma.player.findFirst();
            console.log(`  Sample: ${one.lastName}, ${one.firstName} (Contact: ${one.contactName})`);
        }
    } catch (e) {
        console.log(`  Error or no Player table: ${e.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const dbs = [
        'prisma/dev.db',
        'prisma/old_dev.db',
        'data/prod.db',
        'dev.db',
        'prod.db'
    ];

    for (const db of dbs) {
        await checkDb(db);
    }
}

main();
