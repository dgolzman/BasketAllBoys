import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPlayer() {
    try {
        const players = await prisma.player.findMany({
            where: {
                OR: [
                    { dni: '52643526' },
                    { lastName: { contains: 'PIRIS' } }
                ]
            }
        });
        console.log(JSON.stringify(players, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkPlayer();
