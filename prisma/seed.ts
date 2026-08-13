import { prisma } from '../lib/prisma';

async function main() {
  // Clear existing data safely before seeding
  await prisma.message.deleteMany();
  await prisma.favorite.deleteMany();

  // Seed Messages
  await prisma.message.createMany({
    data: [
      { name: 'Alice', email: 'a@tsu.ac.th', message: 'สวัสดี' },
      { name: 'Bob', email: 'b@tsu.ac.th', message: 'Hello' },
    ],
  });

  // Seed Favorites (for Workshop)
  await prisma.favorite.createMany({
    data: [
      {
        title: 'Next.js Documentation',
        url: 'https://nextjs.org/docs',
        category: 'Documentation',
      },
      {
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs/',
        category: 'Tutorial',
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
