const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Backfilling Coach Salary History ---');

    // Find coaches with salary > 0 but no salary history
    const coaches = await prisma.coach.findMany({
        where: {
            salary: { gt: 0 },
            salaryHistory: {
                none: {}
            }
        }
    });

    console.log(`Found ${coaches.length} coaches needing salary history backfill.`);

    for (const coach of coaches) {
        // Use registrationDate if available, otherwise createdAt, otherwise current date
        const backfillDate = coach.registrationDate || coach.createdAt || new Date();

        console.log(`Backfilling for ${coach.name}: $${coach.salary} starting from ${backfillDate}`);

        await prisma.salaryHistory.create({
            data: {
                amount: coach.salary,
                coachId: coach.id,
                date: backfillDate
            }
        });
    }

    console.log('--- Backfill Completed ---');
}

main()
    .catch((e) => {
        console.error('Error during backfill:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
