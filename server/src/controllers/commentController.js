// server/src/controllers/commentController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a comment
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentId } = req.body;
        const userId = req.user.id;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Validate content
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if parent comment exists if parentId is provided
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parseInt(parentId) }
            });

            if (!parentComment) {
                return res.status(404).json({ error: 'Parent comment not found' });
            }
        }

        // Create comment
        const comment = await prisma.comment.create({
            data: {
                content,
                userId,
                postId: parseInt(postId),
                parentId: parentId ? parseInt(parentId) : null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        // Create notification for post owner (if not self-comment)
        if (post.userId !== userId) {
            await prisma.notification.create({
                data: {
                    type: 'comment',
                    recipientId: post.userId,
                    senderId: userId,
                    postId: parseInt(postId),
                    commentId: comment.id
                }
            });
        }

        // If this is a reply, also notify the parent comment owner
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parseInt(parentId) }
            });

            if (parentComment && parentComment.userId !== userId) {
                await prisma.notification.create({
                    data: {
                        type: 'reply',
                        recipientId: parentComment.userId,
                        senderId: userId,
                        postId: parseInt(postId),
                        commentId: comment.id
                    }
                });
            }
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Server error while creating comment' });
    }
};

// Get comments for a post
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id; // Optional, used to check if user liked comments

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Get top-level comments (no parentId)
        const comments = await prisma.comment.findMany({
            where: {
                postId: parseInt(postId),
                parentId: null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        },
                        _count: {
                            select: {
                                likes: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                _count: {
                    select: {
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // If userId is provided, check which comments the user has liked
        let commentIds = comments.map(c => c.id);
        let replyIds = comments.flatMap(c => c.replies.map(r => r.id));
        let allCommentIds = [...commentIds, ...replyIds];
        
        let userLikes = [];
        if (userId) {
            userLikes = await prisma.commentLike.findMany({
                where: {
                    userId: userId,
                    commentId: {
                        in: allCommentIds
                    }
                },
                select: {
                    commentId: true
                }
            });
        }

        const userLikedCommentIds = userLikes.map(like => like.commentId);

        // Add isLiked flag to comments and replies
        const commentsWithLikeInfo = comments.map(comment => ({
            ...comment,
            isLiked: userLikedCommentIds.includes(comment.id),
            replies: comment.replies.map(reply => ({
                ...reply,
                isLiked: userLikedCommentIds.includes(reply.id)
            }))
        }));

        res.status(200).json(commentsWithLikeInfo);
    } catch (error) {
        console.error('Get post comments error:', error);
        res.status(500).json({ error: 'Server error retrieving comments' });
    }
};

// Update a comment
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        // Check if comment exists
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user is the comment owner
        if (comment.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this comment' });
        }

        // Validate content
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Update comment
        const updatedComment = await prisma.comment.update({
            where: { id: parseInt(commentId) },
            data: { content },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        });

        res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ error: 'Server error while updating comment' });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
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

        // Check if user is the comment owner
        if (comment.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        // Delete all likes for this comment
        await prisma.commentLike.deleteMany({
            where: { commentId: parseInt(commentId) }
        });

        // Delete all notifications related to this comment
        await prisma.notification.deleteMany({
            where: { commentId: parseInt(commentId) }
        });

        // Delete the comment
        await prisma.comment.delete({
            where: { id: parseInt(commentId) }
        });

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Server error while deleting comment' });
    }
};

module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment
};
