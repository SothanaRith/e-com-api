const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../utils/fileUpload"); // File upload middleware

// Core product operations
router.get("/get-all/:userId", productController.getAllProducts);
router.get("/get-product/:id/:userId", productController.getProductById);
router.post("/create-product", upload.array('images', 5), productController.createProduct);
router.post("/update-product/:productId", upload.array('images', 5), productController.updateProduct);
router.delete("/delete/:productId", productController.deleteProduct);

// Product purchase & orders
router.post("/buy/:userId", productController.buyProduct);
router.post("/place-order", productController.placeOrder);
router.get("/orders/:userId", productController.getOrdersByUser);

// Product reviews
router.post("/create-reviews", upload.array('images', 5), productController.addReview);
router.get("/product/:id/reviews", productController.getProductReviews);

// Search
router.get("/search/:userId", productController.searchProducts);

// Variant operations
router.post("/variant/:productId/add", productController.addVariant);
router.post("/variant/:variantId/update", productController.updateVariant);
router.post("/variant/:variantId/delete", productController.deleteVariant);

// Cart operations
router.post("/cart/add", productController.addToCart);
router.get("/cart/:userId", productController.getCart);
router.post("/cart/:userId/:productId/delete", productController.removeFromCart);

router.post('/wishlist', productController.addToWishlist);
router.get('/wishlist/:userId', productController.getWishlist);
router.post('/wishlist/delete/:userId/:productId', productController.removeFromWishlist);

module.exports = router;

