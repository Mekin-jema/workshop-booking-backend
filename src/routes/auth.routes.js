const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const { validateUser } = require("../middleware/validation");

// Customer registration
router.post("/register", validateUser, register);

// Admin/Customer login
router.post("/login", login);

module.exports = router;