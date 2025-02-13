const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('find_chat_db', 'root', '', {
  host: 'localhost', // Change this if your MySQL is hosted elsewhere
  dialect: 'mysql',
  port: 3306,
  logging: false, // Disable logging for cleaner output
});

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL database connected successfully!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
