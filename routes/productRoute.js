const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../utils/fileUpload"); // Import the helper

// Use upload middleware
router.post("/create-product", upload.single("image"), productController.createProduct);
router.put("/update-product/:productId", upload.single("image"), productController.updateProduct);
router.post("/get-product/:id", productController.getProductById);
// router.g("/placeOrder", productController.placeOrder);

console.log("Working =====================")

module.exports = router;
