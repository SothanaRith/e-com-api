const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Promotion = sequelize.define("Promotion", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    discountType: { type: DataTypes.ENUM('percentage', 'fixed'), allowNull: false },
    value: { type: DataTypes.FLOAT, allowNull: false },
    validFrom: { type: DataTypes.DATE },
    validTo: { type: DataTypes.DATE },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    timestamps: true,
});

module.exports = Promotion;
