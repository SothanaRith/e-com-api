const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contentRoutes = require("./routes/contentRoutes");
const categoryRoute = require("./routes/categoryRoute");
const productRoute = require("./routes/productRoute");
const loadHomeRoute = require("./routes/loadHomeRoute");
const sampleCategories = require("./helpers/sampleCategories");
const Category = require("./models/Category");
const sampleReviews = require("./helpers/sampleReviews");
const Review = require("./models/Review");
const {Product} = require("./models");
const sampleProducts = require("./helpers/sampleProducts");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/home", loadHomeRoute);

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  const PORT = 3000;
  app.listen(PORT, () => {
    async function insertCategories() {
      try {
        for (const categoryData of sampleCategories) {
          await Category.create(categoryData);
        }
        console.log('Categories inserted successfully');
      } catch (error) {
        console.error('Error inserting categories:', error);
      }
    }

// Insert reviews
    async function insertReviews() {
      try {
        for (const reviewData of sampleReviews) {
          await Review.create(reviewData);
        }
        console.log('Reviews inserted successfully');
      } catch (error) {
        console.error('Error inserting reviews:', error);
      }
    }

    async function insertSampleProducts() {
      try {
        for (const productData of sampleProducts) {
          await Product.create(productData);
        }
        console.log('Sample products inserted successfully');
      } catch (error) {
        console.error('Error inserting sample products:', error);
      }
    }

// Insert all data
//     async function insertSampleData() {
//       await insertCategories();
//       await insertSampleProducts();
//     }
//     insertSampleData();
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
