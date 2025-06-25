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
const vendorRoute = require("./routes/vendorRoute");
const adminRoute = require("./routes/adminRoute");
const roleRoute = require("./routes/roleRoute");
const permissionRoute = require("./routes/permissionRoute");
const deliveryAddressRoutes = require("./routes/deliveryAddressRoutes");
const adminNotification = require("./config/firebase_admin");
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // Import the notification routes


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
app.use("/api/vendor", vendorRoute);
app.use("/api/admin", adminRoute);
app.use("/api/role", roleRoute);
app.use("/api/permission", permissionRoute);
app.use("/api/delivery-addresses", deliveryAddressRoutes);
app.use("/api/notification", notificationRoutes);
app.use('/api/payment', paymentRoutes);

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  const PORT = 3000;
  app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
