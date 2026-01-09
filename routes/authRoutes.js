const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  registerTeacher,
  login,
  changePassword
} = require("../controllers/authController");

/**
 * ==============================
 * PUBLIC ROUTES
 * ==============================
 */

// Teacher self-registration
router.post("/register-teacher", registerTeacher);

// Login (Teacher & Student)
router.post("/login", login);

/**
 * ==============================
 * PROTECTED ROUTES
 * ==============================
 */

// Change password (Teacher & Student)
router.post("/change-password", protect(), changePassword);

module.exports = router;
