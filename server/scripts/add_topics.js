// server/scripts/add_topics.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Adding default topics...');
    
    // Define default topics
    const defaultTopics = [
      { name: 'Loodus' },
      { name: 'Tehnoloogia' },
      { name: 'Sport' },
      { name: 'Toit' },
      { name: 'Reisimine' },
      { name: 'Muusika' },
      { name: 'Kunst' },
      { name: 'Haridus' },
      { name: 'Meelelahutus' },
      { name: 'Mood' }
    ];
    
    // Add each topic if it doesn't already exist
    for (const topic of defaultTopics) {
      const existingTopic = await prisma.topic.findFirst({
        where: { name: topic.name }
      });
      
      if (!existingTopic) {
        await prisma.topic.create({
          data: topic
        });
        console.log(`Added topic: ${topic.name}`);
      } else {
        console.log(`Topic already exists: ${topic.name}`);
      }
    }
    
    console.log('Topics added successfully!');
  } catch (error) {
    console.error('Error adding topics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
