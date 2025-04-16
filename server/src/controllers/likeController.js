// server/src/controllers/likeController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Like a post
const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user already liked the post
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: parseInt(postId)
                }
            }
        });

        if (existingLike) {
            return res.status(400).json({ error: 'Post already liked' });
        }

        // Create like
        const like = await prisma.like.create({
            data: {
                userId: userId,
                postId: parseInt(postId)
            }
        });

        // Create notification for post owner (if not self-like)
        if (post.userId !== userId) {
            await prisma.notification.create({
                data: {
                    type: 'like',
                    recipientId: post.userId,
                    senderId: userId,
                    postId: parseInt(postId)
                }
            });
        }

        res.status(201).json({ message: 'Post liked successfully' });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Server error while liking post' });
    }
};

// Unlike a post
const unlikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if like exists
        const like = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: parseInt(postId)
                }
            }
        });

        if (!like) {
            return res.status(400).json({ error: 'Post not liked' });
        }

        // Delete like
        await prisma.like.delete({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: parseInt(postId)
                }
            }
        });

        res.status(200).json({ message: 'Post unliked successfully' });
    } catch (error) {
        console.error('Unlike post error:', error);
        res.status(500).json({ error: 'Server error while unliking post' });
    }
};

// Get likes for a post
const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Get likes with user info
        const likes = await prisma.like.findMany({
            where: { postId: parseInt(postId) },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Count total likes
        const likeCount = await prisma.like.count({
            where: { postId: parseInt(postId) }
        });

        res.status(200).json({
            likes,
            count: likeCount
        });
    } catch (error) {
        console.error('Get post likes error:', error);
        res.status(500).json({ error: 'Server error retrieving likes' });
    }
};

// Like a comment
const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        // Check if comment exists
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) },
            include: { post: true }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user already liked the comment
        const existingLike = await prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId: userId,
                    commentId: parseInt(commentId)
                }
            }
        });

        if (existingLike) {
            return res.status(400).json({ error: 'Comment already liked' });
        }

        // Create comment like
        const like = await prisma.commentLike.create({
            data: {
                userId: userId,
                commentId: parseInt(commentId)
            }
        });

        // Create notification for comment owner (if not self-like)
        if (comment.userId !== userId) {
            await prisma.notification.create({
                data: {
                    type: 'commentLike',
                    recipientId: comment.userId,
                    senderId: userId,
                    postId: comment.postId,
                    commentId: parseInt(commentId)
                }
            });
        }

        res.status(201).json({ message: 'Comment liked successfully' });
    } catch (error) {
        console.error('Like comment error:', error);
        res.status(500).json({ error: 'Server error while liking comment' });
    }
};

// Unlike a comment
const unlikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        // Check if comment exists
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if like exists
        const like = await prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId: userId,
                    commentId: parseInt(commentId)
                }
            }
        });

        if (!like) {
            return res.status(400).json({ error: 'Comment not liked' });
        }

        // Delete like
        await prisma.commentLike.delete({
            where: {
                userId_commentId: {
                    userId: userId,
                    commentId: parseInt(commentId)
                }
            }
        });

        res.status(200).json({ message: 'Comment unliked successfully' });
    } catch (error) {
        console.error('Unlike comment error:', error);
        res.status(500).json({ error: 'Server error while unliking comment' });
    }
};

module.exports = {
    likePost,
    unlikePost,
    getPostLikes,
    likeComment,
    unlikeComment
};
