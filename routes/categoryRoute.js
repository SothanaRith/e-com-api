const express = require('express');
const router = express.Router();
const {createCategory, getAllCategories, updateCategory, getProductByCategory, getCategoryById, deleteCategory} = require('../controllers/CategoryController');
const upload = process.env.NODE_ENV === 'production'
    ? require('../middleware/s3Upload') : require('../utils/fileUpload');

// Define the route to get all users
router.post("/create-category", upload.single("image"), createCategory);
router.get('/get-all-categories', getAllCategories);
router.get('/get-category/:id', getCategoryById);
router.post('/update-category/:id', upload.single("image"), updateCategory);
router.get("/categories/:categoryId/userId/:userId", getProductByCategory);

module.exports = router;