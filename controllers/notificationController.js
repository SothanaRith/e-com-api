const { Op } = require('sequelize');
const Notification = require('../models/Notification');
const NotificationRead = require("../models/NotificationRead");
const User = require("../models/User");

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

exports.getUsersWithNotifications = async (req, res) => {
    try {
        // ---- Paging + filter ----------------------------------------------------
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
        const size = Math.max(parseInt(req.query.size, 10) || 10, 1)
        const offset = (page - 1) * size
        const onlyUnread = String(req.query.onlyUnread || '').toLowerCase() === 'true'

        // ---- 1) Page over users -------------------------------------------------
        const totalUsers = await User.count()
        const users = await User.findAll({
            attributes: ['id', 'name', 'email'],
            order: [['createdAt', 'DESC']],
            offset,
            limit: size,
        })
        const userIds = users.map(u => u.id)

        if (userIds.length === 0) {
            return res.status(200).json(
                {
                    users: [],
                    pagination: {
                        currentPage: page,
                        pageSize: size,
                        totalItems: totalUsers,
                        totalPages: Math.ceil(totalUsers / size),
                    },
                }
            )
        }

        // ---- 2) Load personal notifications ------------------------------------
        const personalNotifs = await Notification.findAll({
            where: { userId: { [Op.in]: userIds } },
            order: [
                ['sentAt', 'DESC'],
                ['createdAt', 'DESC'],
            ],
        })

        // ---- 3) Bucket notifications by userId ---------------------------------
        const bucket = new Map()
        for (const uId of userIds) bucket.set(uId, [])
        for (const notif of personalNotifs) {
            const arr = bucket.get(notif.userId) || []
            arr.push(notif)
            bucket.set(notif.userId, arr)
        }

        // ---- 4) Build response per user ----------------------------------------
        const result = users.map(u => {
            let combined = (bucket.get(u.id) || []).map(n => {
                const json = n.toJSON()
                const sentAt = json.sentAt || json.createdAt || null
                return {
                    ...json,
                    sentAt,
                    status: json.status === 'read' ? 'read' : 'unread',
                }
            })

            if (onlyUnread) {
                combined = combined.filter(n => n.status === 'unread')
            }

            // sort newest first
            combined.sort((a, b) => {
                const aTime = a.sentAt ? new Date(a.sentAt).getTime() : 0
                const bTime = b.sentAt ? new Date(b.sentAt).getTime() : 0
                return bTime - aTime
            })

            return {
                user: {
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    notifications: combined,
                },
            }
        })

        // ---- 5) Send ------------------------------------------------------------
        return res.status(200).json(
            {
                message: 'Users with notifications fetched successfully',
                users: result,
                pagination: {
                    currentPage: page,
                    pageSize: size,
                    totalItems: totalUsers,
                    totalPages: Math.ceil(totalUsers / size),
                },
            }
        )
    } catch (error) {
        console.error('Error in getUsersWithNotifications:', error)
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message })
    }
}