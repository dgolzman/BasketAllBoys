const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@allboys.com'; // Default admin
    const password = await bcrypt.hash('AllBoys2026!', 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { password },
        create: {
            email,
            name: 'Admin All Boys',
            password,
            role: 'ADMIN',
        },
    });

    console.log({ user });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
