const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

// Teacher Dashboard
router.get("/teacher", protect(["teacher"]), (req, res) => {
  res.json({
    message: "Welcome Teacher",
    user: req.user
  });
});

// Student Dashboard
router.get("/student", protect(["student"]), (req, res) => {
  res.json({
    message: "Welcome Student",
    user: req.user
  });
});

module.exports = router;
