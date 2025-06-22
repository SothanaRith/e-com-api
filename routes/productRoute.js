const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const {allowRole, authenticateToken} = require("../middleware/authenticateToken");
const upload = require('../middleware/s3Upload');
// Core product operations
router.get("/get-all/:userId", productController.getAllProducts);
router.get("/get-product/:id/:userId", productController.getProductById);
router.post("/create-product", upload.array('images', 5), productController.createProduct);
router.post("/update-product/:productId", upload.array('images', 5), productController.updateProduct);
router.delete("/delete/:productId", productController.deleteProduct);
router.patch('/:productId/update-stock', productController.updateTotalStock);

// Product purchase & orders
router.post("/buy/:userId", productController.buyProduct);
router.post("/place-order", productController.placeOrder);
router.get("/orders/:userId", productController.getOrdersByUser);
router.post('/orders/:orderId/status', productController.updateOrderStatus);
router.get('/transactions/:status/:userId', productController.getTransactionsByUser);
router.get('/admin/orders/processed', productController.getAdminGroupedOrders);
router.get('/orders/:orderId/detail', productController.getOrderDetailById);
router.put('/transactions/by-order/:orderId/update', productController.updateTransactionByOrderId);

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
router.post("/cart/add", productController.addOrUpdateCart);
router.get("/cart/:userId", productController.getCart);
router.post("/cart/:userId/:productId/delete", productController.removeFromCart);

router.post('/wishlist', productController.addToWishlist);
router.get('/wishlist/:userId', productController.getWishlist);
router.post('/wishlist/delete/:userId/:productId', productController.removeFromWishlist);

module.exports = router;

