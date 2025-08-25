const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const Chat = require('./models/Chat');
const User = require('./models/User');

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
const historyRoutes = require("./routes/historyRoutes");

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
app.use("/api/history", historyRoutes);

// Create an HTTP server and bind Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

const userSockets = {};

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New user connected: ' + socket.id);

  // When user connects, store mapping
  socket.on('registerUser', (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} is connected with socket ID: ${socket.id}`);
  });

  // When message is sent
  socket.on('sendMessage', async (data) => {
    const { sender_id, receiver_id, message, image_base64 } = data;

    let fileUrl;
    if (image_base64) {
      // Decode base64 and save as image file
      const buffer = Buffer.from(image_base64, 'base64');
      const fileName = `${Date.now()}.png`;  // Use timestamp for unique file name
      const filePath = path.join(__dirname, 'uploads', fileName);

      fs.writeFileSync(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    }

    // Save message to database with the image URL if available
    const newMessage = await Chat.create({
      sender_id,
      receiver_id,
      message,
      file_url: fileUrl,
    });

    // Emit new message to client
    io.to(userSockets[receiver_id]).emit('newMessage', newMessage);
    socket.emit('newMessage', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
    // Remove user from map
    for (const [userId, id] of Object.entries(userSockets)) {
      if (id === socket.id) delete userSockets[userId];
    }
  });
});

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on :${PORT}`);
  });
});
