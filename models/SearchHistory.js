const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");  // Assuming you have a User model

const SearchHistory = sequelize.define("SearchHistory", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
  },
  query: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
});

SearchHistory.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

module.exports = SearchHistory;
