
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando limpieza de datos de prueba...');

    const patterns = [
        { name: { contains: 'Test' } },
        { name: { contains: 'Prueba' } },
        { name: { contains: 'Verificado' } },
        { name: { contains: 'Borrar' } },
        { name: { contains: 'Contacto' } },
    ];

    try {
        for (const pattern of patterns) {
            const deleted = await prisma.coach.deleteMany({
                where: pattern,
            });
            if (deleted.count > 0) {
                console.log(`Eliminados ${deleted.count} entrenadores con patrón: ${JSON.stringify(pattern)}`);
            }
        }
        console.log('Limpieza completada.');
    } catch (error) {
        console.error('Error durante la limpieza:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
