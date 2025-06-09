const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Your database configuration

const Notification = sequelize.define('Notification', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    body: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: { // 'read' or 'unread'
        type: DataTypes.STRING,
        defaultValue: 'unread',
    },
    sentAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    fcmToken: {
        type: DataTypes.STRING, // Optional, if you want to store a token for targeting a device
        allowNull: true,
    }
});

module.exports = Notification;
