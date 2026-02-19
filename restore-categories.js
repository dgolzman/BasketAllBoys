const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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

    console.log('Restaurando categorías...');
    for (const cat of categories) {
        await prisma.categoryMapping.upsert({
            where: { category: cat.category },
            update: cat,
            create: cat,
        });
    }
    console.log('✅ Categorías restauradas con éxito.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
