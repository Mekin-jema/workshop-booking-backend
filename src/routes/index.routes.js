const express = require("express");
const router = express.Router();

// Import all route files
const authRoutes = require("./auth.routes");
const workshopRoutes = require("./workshops.routes");
const bookingRoutes = require("./bookings.routes");

// Mount routes
router.use("/api/auth", authRoutes);
router.use("/api/workshops", workshopRoutes);
router.use("/api/bookings", bookingRoutes);
router.use("/api/stats",authRoutes)

module.exports = router;