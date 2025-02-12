const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const LivedPlace = sequelize.define("LivedPlace", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  lat: { type: DataTypes.DECIMAL(10, 7) },
  long: { type: DataTypes.DECIMAL(10, 7) },
  title: { type: DataTypes.STRING },
  image: { type: DataTypes.TEXT },
  startSince: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING, defaultValue: "public" },
  isLivingHere: { type: DataTypes.BOOLEAN, defaultValue: false },
});

LivedPlace.belongsTo(User, { foreignKey: "userId" });
module.exports = LivedPlace;
