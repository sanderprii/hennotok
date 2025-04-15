const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Register new user
const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        // Return the user without the password
        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            createdAt: newUser.createdAt,
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data and token
        res.status(200).json({
            id: user.id,
            username: user.username,
            token,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};