const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@allboys.com';
    const inputPassword = 'admin123';

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User found:', user.email);
    console.log('Stored Hash:', user.password);

    const match = await bcrypt.compare(inputPassword, user.password);
    console.log('Password Match:', match);
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
