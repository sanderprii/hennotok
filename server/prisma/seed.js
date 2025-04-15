// server/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const topics = [
        { name: 'Travel' },
        { name: 'Food' },
        { name: 'Fitness' },
        { name: 'Pets' },
        { name: 'Fashion' },
        { name: 'Technology' },
        { name: 'Art' },
        { name: 'Music' },
        { name: 'Nature' },
        { name: 'Gaming' }
    ];

    console.log('Seeding topics...');

    for (const topic of topics) {
        await prisma.topic.upsert({
            where: { name: topic.name },
            update: {},
            create: topic
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });