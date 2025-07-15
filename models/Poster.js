const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Poster = sequelize.define("Poster", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
});

module.exports = Poster;
