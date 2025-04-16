// server/src/routes/likeRoutes.js
const express = require('express');
const {
    likePost,
    unlikePost,
    getPostLikes,
    likeComment,
    unlikeComment
} = require('../controllers/likeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Post likes
router.post('/posts/:postId', authenticateToken, likePost);
router.delete('/posts/:postId', authenticateToken, unlikePost);
router.get('/posts/:postId', authenticateToken, getPostLikes);

// Comment likes
router.post('/comments/:commentId', authenticateToken, likeComment);
router.delete('/comments/:commentId', authenticateToken, unlikeComment);

module.exports = router;
