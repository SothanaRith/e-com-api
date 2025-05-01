const express = require('express');
const router = express.Router();
const loadHomeController = require("../controllers/loadHomeController");
router.get("/loadHome", loadHomeController.loadHome);
module.exports = router;