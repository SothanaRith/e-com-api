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
    timestamps: true,
});

Wishlist.associate = models => {
    Wishlist.belongsTo(models.User, { foreignKey: 'userId' });
    Wishlist.belongsTo(models.Product, { foreignKey: 'productId' }); // this enables include
};

module.exports = Wishlist;
