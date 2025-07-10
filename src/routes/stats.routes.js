const express = require("express");
const router = express.Router();
const { 
  getAllBookings,
  updateBookingStatus,
  getDashboardStats,
  createBooking
} = require("../controllers/admin.controller");
const { authenticate, isAdmin } = require("../middleware/auth");

// Admin-only routes

router.get("/stats", authenticate, isAdmin, getDashboardStats);

module.exports = router;