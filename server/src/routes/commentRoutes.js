// server/src/routes/commentRoutes.js
const express = require('express');
const {
    createComment,
    getPostComments,
    updateComment,
    deleteComment
} = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a comment on a post
router.post('/posts/:postId', authenticateToken, createComment);

// Get comments for a post
router.get('/posts/:postId', authenticateToken, getPostComments);

// Update a comment
router.put('/:commentId', authenticateToken, updateComment);

// Delete a comment
router.delete('/:commentId', authenticateToken, deleteComment);

module.exports = router;
