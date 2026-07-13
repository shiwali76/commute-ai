const express = require("express");
const router = express.Router();
const rideController = require("../controllers/rideController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/search", authMiddleware, rideController.searchRides);
router.post("/", authMiddleware, rideController.bookRide);
router.get("/:id/track", authMiddleware, rideController.trackRide);

module.exports = router;
