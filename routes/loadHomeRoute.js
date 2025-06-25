const express = require('express');
const router = express.Router();
const loadHomeController = require("../controllers/loadHomeController");
router.get("/loadHome", loadHomeController.loadHome);

router.get("/slides", loadHomeController.getAllSlides);
// Create Slide
router.post("/slides", loadHomeController.createSlide);

// Update Slide
router.put("/slides/:id", loadHomeController.updateSlide);

// Delete Slide
router.delete("/slides/:id", loadHomeController.deleteSlide);
module.exports = router;