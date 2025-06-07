const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/db');

const DeliveryAddress = sequelize.define('DeliveryAddress', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'DeliveryAddresses',
    timestamps: true,
});

// Hook: ensure only one default per user
DeliveryAddress.beforeCreate(async (address) => {
    if (address.isDefault) {
        await DeliveryAddress.update(
            { isDefault: false },
            { where: { userId: address.userId } }
        );
    }
});

DeliveryAddress.beforeUpdate(async (address) => {
    if (address.isDefault) {
        await DeliveryAddress.update(
            { isDefault: false },
            {
                where: {
                    userId: address.userId,
                    id: { [Op.ne]: address.id },
                },
            }
        );
    }
});

module.exports = DeliveryAddress;
