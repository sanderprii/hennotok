// server/src/controllers/postController.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Create a new post
const createPost = async (req, res) => {
    try {
        const { description, topicId } = req.body;
        const userId = req.user.id;

        // Check if topic exists
        const topic = await prisma.topic.findUnique({
            where: { id: parseInt(topicId) },
        });

        if (!topic) {
            return res.status(400).json({ error: 'Invalid topic selected' });
        }

        // Get file details from validateFile middleware
        const { fileUrl, fileType, fileSize, thumbnailUrl, duration } = req.fileDetails;

        // Create post in database
        const post = await prisma.post.create({
            data: {
                description,
                fileUrl,
                fileType,
                fileSize,
                thumbnailUrl,
                duration,
                userId,
                topicId: parseInt(topicId)
            },
        });

        res.status(201).json({
            id: post.id,
            message: 'Post created successfully',
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Server error during post creation' });
    }
};

// Get all topics
const getAllTopics = async (req, res) => {
    try {
        const topics = await prisma.topic.findMany({
            orderBy: { name: 'asc' }
        });

        res.status(200).json(topics);
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ error: 'Server error retrieving topics' });
    }
};

// Get user posts
const getUserPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.query.userId ? parseInt(req.query.userId) : userId;

        const posts = await prisma.post.findMany({
            where: { userId: targetUserId },
            include: {
                topic: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ error: 'Server error retrieving posts' });
    }
};

// Get feed posts (from followed users only)
const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get IDs of users that current user follows
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true }
        });

        const followingIds = following.map(f => f.followingId);

        // Get posts from followed users or own posts if not following anyone
        const where = followingIds.length > 0
            ? { userId: { in: followingIds } }
            : {}; // If not following anyone, return all posts

        const posts = await prisma.post.findMany({
            where,
            include: {
                topic: true,
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error('Get feed posts error:', error);
        res.status(500).json({ error: 'Server error retrieving feed posts' });
    }
};

// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const { topicId } = req.query;

        const where = topicId ? { topicId: parseInt(topicId) } : {};

        const posts = await prisma.post.findMany({
            where,
            include: {
                topic: true,
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error('Get all posts error:', error);
        res.status(500).json({ error: 'Server error retrieving posts' });
    }
};

// Get posts by topic ID
const getPostsByTopic = async (req, res) => {
    try {
        const { topicId } = req.params;

        const posts = await prisma.post.findMany({
            where: {
                topicId: parseInt(topicId)
            },
            include: {
                topic: true,
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error('Get posts by topic error:', error);
        res.status(500).json({ error: 'Server error retrieving posts' });
    }
};

// Get a specific topic
const getTopicById = async (req, res) => {
    try {
        const { topicId } = req.params;

        const topic = await prisma.topic.findUnique({
            where: { id: parseInt(topicId) }
        });

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        res.status(200).json(topic);
    } catch (error) {
        console.error('Get topic error:', error);
        res.status(500).json({ error: 'Server error retrieving topic' });
    }
};

module.exports = {
    createPost,
    getAllTopics,
    getUserPosts,
    getAllPosts,
    getFeedPosts,
    getPostsByTopic,
    getTopicById
};