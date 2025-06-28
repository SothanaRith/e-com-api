const { Op } = require('sequelize');
const Notification = require('../models/Notification');
const NotificationRead = require("../models/NotificationRead");

// Create notification (user-specific or global)
exports.createNotification = async (req, res) => {
    try {
        const { userId, title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required." });
        }

        const notification = await Notification.create({
            userId: userId || null,
            title,
            body,
        });

        return res.status(201).json({ message: "Notification created successfully", notification });
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get notifications (user + global)
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const size = parseInt(req.query.size, 10) || 10;
        const offset = (page - 1) * size;

        // Get all personal + global notifications
        const whereCondition = {
            [Op.or]: [{ userId }, { userId: null }],
        };

        const totalNotifications = await Notification.count({ where: whereCondition });

        const allNotifications = await Notification.findAll({
            where: whereCondition,
            order: [['sentAt', 'DESC']],
            offset,
            limit: size,
        });

        // Get all global read notifications for this user
        const readRecords = await NotificationRead.findAll({
            where: { userId },
            attributes: ['notificationId'],
        });
        const readIds = readRecords.map(r => r.notificationId);

        // Add custom "status" for frontend
        const notifications = allNotifications.map(n => {
            const isGlobal = n.userId === null;
            const isRead = isGlobal ? readIds.includes(n.id) : n.status === 'read';
            return {
                ...n.toJSON(),
                status: isRead ? 'read' : 'unread',
            };
        });

        const totalUnread = notifications.filter(n => n.status === 'unread').length;

        return res.status(200).json({
            message: 'Notifications fetched successfully',
            data: {
                notifications,
                pagination: {
                    currentPage: page,
                    pageSize: size,
                    totalItems: totalNotifications,
                    totalPages: Math.ceil(totalNotifications / size),
                },
                totalUnread,
                totalNotifications,
            },
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Mark notification as read
exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Personal notification
        if (notification.userId) {
            notification.status = 'read';
            await notification.save();
        } else {
            // Global notification — log read
            await NotificationRead.findOrCreate({
                where: {
                    userId,
                    notificationId: id,
                },
            });
        }

        return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Error updating notification:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await notification.destroy();

        return res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getGlobalNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const size = parseInt(req.query.size, 10) || 10;
        const offset = (page - 1) * size;

        const total = await Notification.count({ where: { userId: null } });

        const notifications = await Notification.findAll({
            where: { userId: null },
            order: [['sentAt', 'DESC']],
            offset,
            limit: size,
        });

        return res.status(200).json({
            message: "Global notifications fetched successfully",
            data: {
                notifications,
                pagination: {
                    currentPage: page,
                    pageSize: size,
                    totalItems: total,
                    totalPages: Math.ceil(total / size),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching global notifications:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};