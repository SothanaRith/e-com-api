const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../utils/fileUpload"); // Import the helper

// Use upload middleware
router.get("/get-all", productController.getAllProducts)
router.get("/get-product/:id", productController.getProductById);
router.post("/create-product", upload.array('images', 5), productController.createProduct);
router.put("/update-product/:productId", upload.array('images', 5), productController.updateProduct);
// router.post("/create-cart/:userId",  productController.a);
router.post("/buy/:userId",  productController.buyProduct);
// router.g("/placeOrder", productController.placeOrder);
router.delete("/delete/:productId", productController.deleteProduct);

module.exports = router;
