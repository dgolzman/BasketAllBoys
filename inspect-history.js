const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const historyCount = await prisma.salaryHistory.count();
    console.log(`Total SalaryHistory records: ${historyCount}`);

    if (historyCount > 0) {
        const records = await prisma.salaryHistory.findMany({
            take: 5,
            include: { Coach: true }
        });
        console.log('Sample records:', JSON.stringify(records, null, 2));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
