const express = require('express');
const { registerUser } = require('../controllers/userController');
const { validateSignUp } = require('../middleware/validation');

const router = express.Router();

// Register route
router.post('/register', validateSignUp, registerUser);

module.exports = router;