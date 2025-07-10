const express = require("express");
const router = express.Router();
const { 
  createBooking, 
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  getAllBookings,
  cancelBooking
} = require("../controllers/bookings.controller");

const { authenticate, isAdmin } = require("../middleware/auth");

// ---------------------------
// Customer Routes
// ---------------------------

// Create a new booking
router.post("/", authenticate, createBooking);

// Get all bookings for the logged-in customer
router.get("/my", authenticate, getUserBookings);

// Get a specific booking by ID
router.get("/:id", authenticate, getBookingById);

// Cancel a booking
router.patch("/:id/cancel", authenticate,isAdmin, cancelBooking);

// ---------------------------
// Admin Routes
// ---------------------------

// Get all bookings (paginated, admin only)
router.get("/", authenticate, isAdmin, getAllBookings);

// Update booking status (admin only)
router.patch("/:id/update", authenticate, isAdmin, updateBookingStatus);

module.exports = router;
