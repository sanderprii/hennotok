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

// Search users
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.id;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Find users matching the query (excluding the current user)
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: query,
                    mode: 'insensitive'
                },
                id: {
                    not: userId
                }
            },
            select: {
                id: true,
                username: true,
                bio: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            },
        });

        // Check if current user follows each result
        const usersWithFollowStatus = await Promise.all(
            users.map(async (user) => {
                const followStatus = await prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: userId,
                            followingId: user.id
                        }
                    }
                });

                return {
                    ...user,
                    isFollowing: !!followStatus
                };
            })
        );

        res.status(200).json(usersWithFollowStatus);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Server error while searching users' });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if requested profile is the current user's profile
        const isSelfProfile = Number(userId) === currentUserId;

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                username: true,
                bio: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get posts
        const posts = await prisma.post.findMany({
            where: { userId: Number(userId) },
            include: {
                topic: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Check if current user follows this profile
        let isFollowing = false;
        if (!isSelfProfile) {
            const followStatus = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: Number(userId)
                    }
                }
            });
            isFollowing = !!followStatus;
        }

        res.status(200).json({
            user: {
                ...user,
                isFollowing,
                isSelfProfile
            },
            posts
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Server error retrieving user profile' });
    }
};

// Follow a user
const followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user.id;

        // Check if trying to follow self
        if (Number(userId) === followerId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: followerId,
                    followingId: Number(userId)
                }
            }
        });

        if (existingFollow) {
            return res.status(400).json({ error: 'Already following this user' });
        }

        // Create follow relationship
        await prisma.follow.create({
            data: {
                followerId: followerId,
                followingId: Number(userId)
            }
        });

        res.status(201).json({ message: 'Successfully followed user' });
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ error: 'Server error while following user' });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user.id;

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if following
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: followerId,
                    followingId: Number(userId)
                }
            }
        });

        if (!follow) {
            return res.status(400).json({ error: 'Not following this user' });
        }

        // Delete follow relationship
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: followerId,
                    followingId: Number(userId)
                }
            }
        });

        res.status(200).json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ error: 'Server error while unfollowing user' });
    }
};

// Get followers list
const getFollowers = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetId = req.params.userId ? Number(req.params.userId) : userId;

        // Get followers
        const followers = await prisma.follow.findMany({
            where: { followingId: targetId },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        bio: true,
                        _count: {
                            select: {
                                followers: true,
                                following: true
                            }
                        }
                    }
                }
            }
        });

        // Check if current user follows each follower
        const followersWithStatus = await Promise.all(
            followers.map(async (follow) => {
                if (follow.follower.id === userId) {
                    return {
                        ...follow.follower,
                        isFollowing: false,
                        isSelf: true
                    };
                }

                const followStatus = await prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: userId,
                            followingId: follow.follower.id
                        }
                    }
                });

                return {
                    ...follow.follower,
                    isFollowing: !!followStatus,
                    isSelf: false
                };
            })
        );

        res.status(200).json(followersWithStatus);
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ error: 'Server error retrieving followers' });
    }
};

// Get following list
const getFollowing = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetId = req.params.userId ? Number(req.params.userId) : userId;

        // Get following
        const following = await prisma.follow.findMany({
            where: { followerId: targetId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        bio: true,
                        _count: {
                            select: {
                                followers: true,
                                following: true
                            }
                        }
                    }
                }
            }
        });

        // Check if current user follows each followed user
        const followingWithStatus = await Promise.all(
            following.map(async (follow) => {
                if (follow.following.id === userId) {
                    return {
                        ...follow.following,
                        isFollowing: false,
                        isSelf: true
                    };
                }

                if (targetId === userId) {
                    // Current user already follows these users
                    return {
                        ...follow.following,
                        isFollowing: true,
                        isSelf: false
                    };
                }

                const followStatus = await prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: userId,
                            followingId: follow.following.id
                        }
                    }
                });

                return {
                    ...follow.following,
                    isFollowing: !!followStatus,
                    isSelf: false
                };
            })
        );

        res.status(200).json(followingWithStatus);
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ error: 'Server error retrieving following users' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    searchUsers,
    getUserProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
};