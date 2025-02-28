const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Contact = sequelize.define("Contact", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  link: { type: DataTypes.TEXT },
  type: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "public" },
  icon: { type: DataTypes.TEXT },
});

Contact.belongsTo(User, { foreignKey: "userId" });
module.exports = Contact;
