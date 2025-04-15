const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/passwordUtils');

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

module.exports = {
    registerUser,
};