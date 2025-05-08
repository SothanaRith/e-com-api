const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../utils/fileUpload"); // File upload middleware

// Core product operations
router.get("/get-all", productController.getAllProducts);
router.get("/get-product/:id", productController.getProductById);
router.post("/create-product", upload.array('images', 5), productController.createProduct);
router.put("/update-product/:productId", upload.array('images', 5), productController.updateProduct);
router.delete("/delete/:productId", productController.deleteProduct);

// Product purchase & orders
router.post("/buy/:userId", productController.buyProduct);
router.post("/place-order", productController.placeOrder);
router.get("/orders/:userId", productController.getOrdersByUser);

// Product reviews
router.post("/create-reviews", upload.array('images', 5), productController.addReview);
router.get("/product/:id/reviews", productController.getProductReviews);

// Search
router.get("/search", productController.searchProducts);

// Variant operations
router.post("/variant/:productId/add", productController.addVariant);
router.put("/variant/:variantId/update", productController.updateVariant);
router.delete("/variant/:variantId", productController.deleteVariant);

// Cart operations
router.post("/cart/add", productController.addToCart);
router.get("/cart/:userId", productController.getCart);
router.delete("/cart/:userId/:productId", productController.removeFromCart);

module.exports = router;

