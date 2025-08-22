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
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
        const offset = (page - 1) * size;
        const onlyUnread = String(req.query.onlyUnread || '').toLowerCase() === 'true';

        // 1) Page over users
        const totalUsers = await User.count();
        const users = await User.findAll({
            attributes: ['id', 'name', 'email'], // add more fields if needed
            order: [['createdAt', 'DESC']],
            offset,
            limit: size,
        });
        const userIds = users.map(u => u.id);
        if (userIds.length === 0) {
            return res.status(200).json(successResponse('OK', {
                users: [],
                pagination: {
                    currentPage: page,
                    pageSize: size,
                    totalItems: totalUsers,
                    totalPages: Math.ceil(totalUsers / size),
                },
            }));
        }

        // 2) Load all personal notifications for these users
        const personalNotifs = await Notification.findAll({
            where: { userId: { [Op.in]: userIds } },
            order: [['sentAt', 'DESC']],
        });

        // 3) Load all global notifications (userId: null)
        const globalNotifs = await Notification.findAll({
            where: { userId: null },
            order: [['sentAt', 'DESC']],
        });

        // 4) Load read records for these users (for global notifications read tracking)
        const readRows = await NotificationRead.findAll({
            where: { userId: { [Op.in]: userIds } },
            attributes: ['userId', 'notificationId'],
            raw: true,
        });

        // Build a per-user set of read global notification IDs for O(1) lookups
        const readMap = new Map(); // userId -> Set(notificationId)
        for (const uId of userIds) readMap.set(uId, new Set());
        for (const row of readRows) {
            if (!readMap.has(row.userId)) readMap.set(row.userId, new Set());
            readMap.get(row.userId).add(row.notificationId);
        }

        // 5) Bucket personal notifications by userId
        const personalBucket = new Map(); // userId -> Notification[]
        for (const uId of userIds) personalBucket.set(uId, []);
        for (const n of personalNotifs) {
            const list = personalBucket.get(n.userId) || [];
            list.push(n);
            personalBucket.set(n.userId, list);
        }

        // 6) Assemble response per user
        const result = users.map(u => {
            const uId = u.id;
            const uPersonal = personalBucket.get(uId) || [];
            const uReadSet = readMap.get(uId) || new Set();

            // Compute status per notification
            const normalize = (n, isGlobal) => {
                const json = n.toJSON();
                // status rules:
                // - personal: use row.status if present (fallback unread)
                // - global: read if there is a NotificationRead(userId, notifId)
                const isRead = isGlobal ? uReadSet.has(json.id) : (json.status === 'read');
                return { ...json, status: isRead ? 'read' : 'unread' };
            };

            // Combine personal + global
            let combined = [
                ...uPersonal.map(n => normalize(n, false)),
                ...globalNotifs.map(n => normalize(n, true)),
            ];

            // Filter only unread if requested
            if (onlyUnread) {
                combined = combined.filter(n => n.status === 'unread');
            }

            // Sort newest first (by sentAt, fallback createdAt)
            combined.sort((a, b) => {
                const aTime = new Date(a.sentAt || a.createdAt || 0).getTime();
                const bTime = new Date(b.sentAt || b.createdAt || 0).getTime();
                return bTime - aTime;
            });

            const total = combined.length;
            const totalUnread = combined.reduce((acc, n) => acc + (n.status === 'unread' ? 1 : 0), 0);

            return {
                user: u,
                notifications: combined,
                totals: { total, totalUnread },
            };
        });

        return res.status(200).json(successResponse('Users with notifications fetched successfully', {
            users: result,
            pagination: {
                currentPage: page,
                pageSize: size,
                totalItems: totalUsers,
                totalPages: Math.ceil(totalUsers / size),
            },
        }));
    } catch (error) {
        console.error('Error in getUsersWithNotifications:', error);
        return res.status(500).json(failResponse('Internal server error', error.message));
    }
};