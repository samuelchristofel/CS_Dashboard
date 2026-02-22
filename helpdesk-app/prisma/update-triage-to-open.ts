import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updatedCount = await prisma.$executeRawUnsafe(
    "UPDATE tickets SET status = 'OPEN' WHERE status = 'TRIAGE';",
  );

  console.log(`Updated ${updatedCount} ticket(s) from TRIAGE to OPEN`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Failed to update TRIAGE tickets:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
