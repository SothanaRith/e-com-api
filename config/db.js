const { Sequelize } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT || 3306,
  logging: false,
  dialectOptions: {
    connectTimeout: 10000, // Timeout in milliseconds (increase if necessary)
  },
});

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL database connected successfully!');
  } catch (error) {
    console.error('Unable to connect to the database:');
  }
})();

module.exports = sequelize;
