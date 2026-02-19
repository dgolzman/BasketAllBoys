const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Audit Logs ---');
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 20
        });
        console.log('Recent Logs:', JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error('Error checking logs:', e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
