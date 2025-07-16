const express = require('express');
const router = express.Router();
const loadHomeController = require("../controllers/loadHomeController");
const upload = process.env.NODE_ENV === 'production'
    ? require('../middleware/s3Upload') : require('../utils/fileUpload');

router.get("/loadHome", loadHomeController.loadHome);

router.get("/slides", loadHomeController.getAllSlides);
// Create Slide
router.post("/slides", loadHomeController.createSlide);

// Update Slide
router.put("/slides/:id", loadHomeController.updateSlide);

// Delete Slide
router.delete("/slides/:id", loadHomeController.deleteSlide);

router.post('/posters', upload.single("image"), loadHomeController.createPoster);   // Create poster
router.put('/posters/:id', upload.single("image"), loadHomeController.updatePoster); // Update poster
router.delete('/posters/:id', loadHomeController.deletePoster); // Delete poster
router.get('/posters/:id', loadHomeController.getPosterById);
router.get('/posters', loadHomeController.getAllPosters);   // Get all posters

module.exports = router;