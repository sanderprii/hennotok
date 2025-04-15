// server/src/routes/postRoutes.js
const express = require('express');
const {
    createPost,
    getAllTopics,
    getUserPosts,
    getAllPosts,
    getPostsByTopic,
    getTopicById
} = require('../controllers/postController');
const { authenticateToken } = require('../middleware/auth');
const { upload, validateFile } = require('../middleware/upload');

const router = express.Router();

// Get all topics
router.get('/topics', getAllTopics);

// Get a specific topic by ID
router.get('/topics/:topicId', getTopicById);

// Create a post (protected route)
router.post(
    '/create',
    authenticateToken,
    upload.single('file'),
    validateFile,
    createPost
);

// Get user's posts (protected route)
router.get('/user', authenticateToken, getUserPosts);

// Get posts by topic ID
router.get('/topic/:topicId', getAllPosts);

// Get all posts (can be filtered by topic)
router.get('/', getAllPosts);

module.exports = router;