const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, updateNotification, deleteNotification, getGlobalNotifications, getUsersWithNotifications } = require('../controllers/notificationController');

// Create a new notification
router.post('/notifications', createNotification);

// Get all notifications for a user
router.get('/notifications/:userId', getNotifications);

// Update (mark as read) a notification
router.put('/notifications/:id', updateNotification);

// Delete a notification
router.delete('/notifications/:id', deleteNotification);

router.get('/notifications-global', getGlobalNotifications);

router.get('/users-with-notifications', getUsersWithNotifications);


module.exports = router;
