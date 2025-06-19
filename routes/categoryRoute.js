const express = require('express');
const router = express.Router();
const {createCategory, getAllCategories, updateCategory, getProductByCategory} = require('../controllers/CategoryController');
const upload = require('../middleware/s3Upload');

// Define the route to get all users
router.post("/create-category", upload.single("image"), createCategory);
router.get('/get-all-categories', getAllCategories);
router.put('/update-category/:id', updateCategory);
router.get("/categories/:categoryId/userId/:userId", getProductByCategory);

module.exports = router;