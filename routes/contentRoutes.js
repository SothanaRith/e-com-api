const express = require("express");
const contentController = require("../controllers/contentController");

const router = express.Router();

// Add new content
router.post("/", contentController.addContent);

// Edit existing content
router.put("/:id", contentController.editContent);

// Delete content by ID
router.delete("/:id", contentController.deleteContent);

// Get all contents
router.get("/", contentController.getAllContents);

module.exports = router;
