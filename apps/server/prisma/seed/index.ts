import { prisma } from '../../src/prisma/client';
import { hashPassword } from '../../src/utils/password';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run seeds.');
  }

  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword) {
    throw new Error('SEED_ADMIN_PASSWORD is required to seed the admin login.');
  }
  const adminPasswordHash = await hashPassword(seedPassword);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN', name: 'Admin', passwordHash: adminPasswordHash },
    create: {
      email: 'admin@example.com',
      role: 'ADMIN',
      name: 'Admin',
      passwordHash: adminPasswordHash,
    },
  });

  await prisma.student.upsert({
    where: { rollNumber: 'A-0001' },
    update: { firstName: 'Amina', lastName: 'Khan', gradeLevel: '10', section: 'A' },
    create: {
      rollNumber: 'A-0001',
      firstName: 'Amina',
      lastName: 'Khan',
      gradeLevel: '10',
      section: 'A',
      guardianName: 'Imran Khan',
      guardianPhone: '+1-555-0101',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
