import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


const prisma = new PrismaClient();

async function main() {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@allboys.com' },
        update: {},
        create: {
            id: generateId(),
            email: 'admin@allboys.com',
            name: 'Administrador',
            password: hashedPassword,
            role: 'ADMIN',
            updatedAt: new Date(),
        },
    });

    console.log('✅ Admin user created:', admin.email);

    // Default Category Mappings for 2026
    const categories = [
        { category: "Mosquitos", minYear: 2018, maxYear: 2030 },
        { category: "Pre-Mini", minYear: 2016, maxYear: 2017 },
        { category: "Mini", minYear: 2014, maxYear: 2015 },
        { category: "U13", minYear: 2013, maxYear: 2013 },
        { category: "U15", minYear: 2011, maxYear: 2012 },
        { category: "U17", minYear: 2009, maxYear: 2010 },
        { category: "U19", minYear: 2007, maxYear: 2008 },
        { category: "Primera", minYear: 1950, maxYear: 2006 },
    ];

    for (const cat of categories) {
        await (prisma as any).categoryMapping.upsert({
            where: { category: cat.category },
            update: { ...cat, updatedAt: new Date() },
            create: { id: generateId(), ...cat, updatedAt: new Date() },
        });
    }

    console.log('✅ Category mappings restored.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
