const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Restoring Users ---');

    // Hardcoded users from Feb 18th backup to be safe
    const usersToRestore = [
        {
            "id": "cmko60zgb0000wn4638esbtz0",
            "name": "Administrador",
            "email": "admin@allboys.com",
            "password": "$2b$10$5.1buNK1FB5Srbv9wZ45mOP5oF.eVOApqZgE0ihfJUExLrm9uBrJe",
            "role": "ADMIN",
            "createdAt": "2026-01-21T15:16:08.699Z",
            "updatedAt": "2026-01-21T15:16:08.699Z"
        },
        {
            "id": "cmko839k30000btonfkstugo7",
            "name": "Damian Golzman",
            "email": "damian@golzman.com.ar",
            "password": "$2b$10$sE9MSiuDdUCwv6g06/cw..lhMFcWwm4TZr6a3bphaDNxyRw1GP6Je",
            "role": "VIEWER",
            "createdAt": "2026-01-21T16:13:54.339Z",
            "updatedAt": "2026-01-21T16:14:03.350Z"
        },
        {
            "id": "cmkplcbee000b2s0cqaifbkms",
            "name": "Fernando",
            "email": "fernando@allboys.com",
            "password": "$2b$10$h8kL1IziDqfrp0RRSvjOweNHUMuPTccPow0XdQIcrdyCfCJfWuQG.",
            "role": "OPERADOR",
            "createdAt": "2026-01-22T15:12:37.814Z",
            "updatedAt": "2026-01-22T15:12:44.470Z"
        }
    ];

    for (const user of usersToRestore) {
        console.log(`Restoring user: ${user.email} (${user.role})`);

        // Use upsert to be safe, though table is currently empty
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                password: user.password,
                role: user.role,
                updatedAt: new Date(user.updatedAt)
            },
            create: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt)
            }
        });
    }

    console.log('--- Restore Completed ---');
}

main()
    .catch((e) => {
        console.error('Error during restoration:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
