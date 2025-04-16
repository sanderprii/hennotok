// server/src/routes/notificationRoutes.js
const express = require('express');
const {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', authenticateToken, markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', authenticateToken, deleteNotification);

module.exports = router;
