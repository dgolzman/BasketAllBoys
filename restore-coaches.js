const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando restauración de entrenadores ---');
    const backupPath = 'backup/backup-allboys-2026-02-18.json';

    if (!fs.existsSync(backupPath)) {
        console.error('Error: El archivo de backup no existe.');
        return;
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const coaches = backup.coaches;

    if (!coaches || coaches.length === 0) {
        console.error('Error: No se encontraron entrenadores en el backup.');
        return;
    }

    console.log(`Encontrados ${coaches.length} entrenadores en el backup.`);

    for (const coach of coaches) {
        // Formatear fechas si existen
        const data = {
            ...coach,
            birthDate: coach.birthDate ? new Date(coach.birthDate) : null,
            registrationDate: coach.registrationDate ? new Date(coach.registrationDate) : null,
            withdrawalDate: coach.withdrawalDate ? new Date(coach.withdrawalDate) : null,
            createdAt: coach.createdAt ? new Date(coach.createdAt) : undefined,
            updatedAt: coach.updatedAt ? new Date(coach.updatedAt) : undefined,
        };

        try {
            await prisma.coach.upsert({
                where: { id: coach.id },
                update: data,
                create: data
            });
            console.log(`Restaurado: ${coach.name}`);
        } catch (error) {
            console.error(`Error restaurando a ${coach.name}:`, error.message);
        }
    }

    console.log('--- Restauración completada ---');
}

main()
    .catch(e => console.error('Error fatal:', e))
    .finally(async () => await prisma.$disconnect());
