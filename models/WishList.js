

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Wishlist = sequelize.define('Wishlist', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true, // optional, for createdAt and updatedAt
});

Wishlist.associate = models => {
    Wishlist.belongsTo(models.User, { foreignKey: 'userId' });
    Wishlist.belongsTo(models.Product, { foreignKey: 'productId' }); // <== REQUIRED for include
};

module.exports = Wishlist;
