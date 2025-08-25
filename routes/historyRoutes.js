const express = require("express");
const router = express.Router();
const HistoryController = require("../controllers/historyController");

// Route to save search history
router.post("/search", HistoryController.saveSearchHistory);

// Route to save product visit history
router.post("/product-visit", HistoryController.saveProductVisitHistory);

router.get("/product-visit/:userId", HistoryController.getProductHistoryByUser);

router.get("/search-history/:userId", HistoryController.getSearchHistoryByUser);

module.exports = router;