const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const { BakongKHQR, khqrData, MerchantInfo, IndividualInfo } = require('bakong-khqr');
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

const sampleCategories = require("./helpers/sampleCategories");
const Category = require("./models/Category");
const Variant = require("./models/VariantModel");
const VariantAttribute = require("./models/VariantAttributeModel");
const sampleReviews = require("./helpers/sampleReviews");
const Review = require("./models/Review");
const {Product} = require("./models");
const sampleProducts = require("./helpers/sampleProducts");
const sampleVariants = require("./helpers/sampleVariants");
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
app.use("/api", adminNotification);
app.use('/api/payment', paymentRoutes);

app.post('/generate-merchant-khqr', (req, res) => {
  const { amount, referenceNumber, merchantId, merchantName } = req.body;

  const optionalData = {
    currency: khqrData.currency.khr,
    amount: amount,
    billNumber: referenceNumber,
    storeLabel: "Devit Huotkeo",
    terminalLabel: "Devit I",
    expirationTimestamp: Date.now() + (1 * 60 * 1000),
  };

  const merchantInfo = new MerchantInfo(
      merchantId,
      merchantName,
      "Battambang",
      1243546472,
      "DEVBKKHPXXX",
      optionalData
  );

  const khqr = new BakongKHQR();
  const response = khqr.generateMerchant(merchantInfo);

  res.json({ qrCode: response });
});


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

    async function insertVariants() {
      try {
        for (const variantData of sampleVariants) {
          // Create the variant record
          const variant = await Variant.create({
            productId: variantData.productId,
            sku: variantData.sku,
            price: variantData.price,
            stock: variantData.stock,
          });

          // Create variant attributes (e.g., Color, Size)
          if (variantData.attributes && Array.isArray(variantData.attributes)) {
            for (const attribute of variantData.attributes) {
              await VariantAttribute.create({
                variantId: variant.id,
                name: attribute.name,
                value: attribute.value,
              });
            }
          }
        }
        console.log('Variants inserted successfully');
      } catch (error) {
        console.error('Error inserting variants:', error);
      }
    }

// Insert all data
//     async function insertSampleData() {
//       await insertCategories()
//       await insertSampleProducts()
//       await insertReviews()
//       await insertVariants()
//     }
//     insertSampleData();
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
