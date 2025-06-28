// models/NotificationRead.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NotificationRead = sequelize.define('NotificationRead', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    notificationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'notification_reads',
    timestamps: false,
});

module.exports = NotificationRead;
