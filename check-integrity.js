const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Integrity Check ---');
    try {
        const userCount = await prisma.user.count();
        console.log(`Total User records: ${userCount}`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: { id: true, email: true, role: true }
            });
            console.log('Users found:', JSON.stringify(users, null, 2));
        } else {
            console.log('CRITICAL: No users found in the database!');
        }

        const coachCount = await prisma.coach.count();
        console.log(`Total Coach records: ${coachCount}`);

        const historyCount = await prisma.salaryHistory.count();
        console.log(`Total SalaryHistory records: ${historyCount}`);

    } catch (e) {
        console.error('Error during database check:', e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
