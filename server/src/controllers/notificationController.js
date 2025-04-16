// server/src/controllers/notificationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user notifications
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get notifications for the user
        const notifications = await prisma.notification.findMany({
            where: { recipientId: userId },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Count unread notifications
        const unreadCount = await prisma.notification.count({
            where: {
                recipientId: userId,
                read: false
            }
        });

        res.status(200).json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Server error retrieving notifications' });
    }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        // Check if notification exists and belongs to the user
        const notification = await prisma.notification.findUnique({
            where: { id: parseInt(notificationId) }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notification.recipientId !== userId) {
            return res.status(403).json({ error: 'Not authorized to access this notification' });
        }

        // Mark notification as read
        await prisma.notification.update({
            where: { id: parseInt(notificationId) },
            data: { read: true }
        });

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification error:', error);
        res.status(500).json({ error: 'Server error marking notification as read' });
    }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        // Mark all user's notifications as read
        await prisma.notification.updateMany({
            where: {
                recipientId: userId,
                read: false
            },
            data: { read: true }
        });

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications error:', error);
        res.status(500).json({ error: 'Server error marking notifications as read' });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        // Check if notification exists and belongs to the user
        const notification = await prisma.notification.findUnique({
            where: { id: parseInt(notificationId) }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notification.recipientId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this notification' });
        }

        // Delete notification
        await prisma.notification.delete({
            where: { id: parseInt(notificationId) }
        });

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Server error deleting notification' });
    }
};

module.exports = {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
};
