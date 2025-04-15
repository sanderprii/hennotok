const express = require('express');
const {
    registerUser,
    loginUser,
    searchUsers,
    getUserProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} = require('../controllers/userController');
const { validateSignUp, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/register', validateSignUp, registerUser);
router.post('/login', validateLogin, loginUser);

// User search route
router.get('/search', authenticateToken, searchUsers);

// Follow/unfollow routes
router.post('/follow/:userId', authenticateToken, followUser);
router.delete('/follow/:userId', authenticateToken, unfollowUser);

// Get followers/following lists
router.get('/followers', authenticateToken, getFollowers);
router.get('/following', authenticateToken, getFollowing);
router.get('/:userId/followers', authenticateToken, getFollowers);
router.get('/:userId/following', authenticateToken, getFollowing);

// Get user profile
router.get('/:userId/profile', authenticateToken, getUserProfile);

module.exports = router;