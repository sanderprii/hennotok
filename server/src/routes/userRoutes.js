const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const { validateSignUp, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Register route
router.post('/register', validateSignUp, registerUser);

// Login route
router.post('/login', validateLogin, loginUser);

module.exports = router;