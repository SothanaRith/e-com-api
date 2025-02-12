const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Content = sequelize.define("Content", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  type: { type: DataTypes.ENUM("Music", "Sport", "Favorite"), allowNull: false },
  title: { type: DataTypes.STRING },
  file: { type: DataTypes.TEXT },
  ownerName: { type: DataTypes.STRING },
  releaseDate: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING, defaultValue: "public" },
});

Content.belongsTo(User, { foreignKey: "userId" });
module.exports = Content;
