const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/match", authMiddleware, matchController.findMatches);

module.exports = router;
