const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Coach Models and data ---');
  try {
    const coaches = await prisma.coach.findMany({
      include: {
        SalaryHistory: true,
      },
    });
    console.log(`Found ${coaches.length} coaches with SalaryHistory (Uppercase)`);
    if (coaches.length > 0) {
        console.log('Sample Coach:', JSON.stringify(coaches[0], null, 2));
    }
  } catch (e) {
    console.log('Error with SalaryHistory (Uppercase):', e.message);
  }

  try {
    const coaches = await prisma.coach.findMany({
      include: {
        salaryHistory: true,
      },
    });
    console.log(`Found ${coaches.length} coaches with salaryHistory (Lowercase)`);
    if (coaches.length > 0) {
        console.log('Sample Coach:', JSON.stringify(coaches[0], null, 2));
    }
  } catch (e) {
    console.log('Error with salaryHistory (Lowercase):', e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
