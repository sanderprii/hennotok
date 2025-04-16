// server/prisma/import-mock-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    try {
        // Read mock data file
        const mockDataPath = path.join(__dirname, '../../mock_data.json');
        const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
        
        console.log('Importing mock data...');
        
        // Import users
        console.log('Importing users...');
        for (const user of mockData.users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {
                    username: user.username,
                    password: user.password,
                    bio: user.bio,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt)
                },
                create: {
                    id: user.id,
                    username: user.username,
                    password: user.password,
                    bio: user.bio,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt)
                }
            });
        }
        
        // Import topics
        console.log('Importing topics...');
        for (const topic of mockData.topics) {
            await prisma.topic.upsert({
                where: { id: topic.id },
                update: { name: topic.name },
                create: { id: topic.id, name: topic.name }
            });
        }
        
        // Import posts
        console.log('Importing posts...');
        for (const post of mockData.posts) {
            await prisma.post.upsert({
                where: { id: post.id },
                update: {
                    userId: post.userId,
                    topicId: post.topicId,
                    description: post.description,
                    fileUrl: post.fileUrl,
                    fileType: post.fileType,
                    fileSize: post.fileSize,
                    thumbnailUrl: post.thumbnailUrl,
                    duration: post.duration,
                    createdAt: new Date(post.createdAt),
                    updatedAt: new Date(post.updatedAt)
                },
                create: {
                    id: post.id,
                    userId: post.userId,
                    topicId: post.topicId,
                    description: post.description,
                    fileUrl: post.fileUrl,
                    fileType: post.fileType,
                    fileSize: post.fileSize,
                    thumbnailUrl: post.thumbnailUrl,
                    duration: post.duration,
                    createdAt: new Date(post.createdAt),
                    updatedAt: new Date(post.updatedAt)
                }
            });
        }
        
        // Import follows
        console.log('Importing follows...');
        for (const follow of mockData.follows) {
            await prisma.follow.upsert({
                where: { 
                    followerId_followingId: {
                        followerId: follow.followerId,
                        followingId: follow.followingId
                    }
                },
                update: {
                    createdAt: new Date(follow.createdAt)
                },
                create: {
                    followerId: follow.followerId,
                    followingId: follow.followingId,
                    createdAt: new Date(follow.createdAt)
                }
            });
        }
        
        console.log('Mock data import completed successfully!');
    } catch (error) {
        console.error('Error importing mock data:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
