const { Notification } = require('../models');

exports.createNotification = async (req, res) => {
    try {
        const { userId, title, body } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({ message: "User ID, title, and body are required." });
        }

        const notification = await Notification.create({
            userId,
            title,
            body
        });

        return res.status(201).json({ message: "Notification created successfully", notification });
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.findAll({
            where: { userId },
            order: [['sentAt', 'DESC']], // Sort notifications by sent time
        });

        return res.status(200).json({ message: "Notifications fetched successfully", notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.status = 'read'; // Mark as read
        await notification.save();

        return res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error updating notification:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

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
