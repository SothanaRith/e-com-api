const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Variant = require("../models/VariantModel"); // Assuming Variant model is in Variant.js

const VariantAttribute = sequelize.define("VariantAttribute", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    variantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Variants", key: "id" },
    },
    name: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false },
}, {
    timestamps: true,
});

VariantAttribute.belongsTo(Variant, { foreignKey: "variantId", as: "variant" });

module.exports = VariantAttribute;