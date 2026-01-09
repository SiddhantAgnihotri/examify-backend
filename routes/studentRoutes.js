const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getAssignedExams,
  startExam,
  submitExam
} = require("../controllers/studentController");

// Student only
router.get("/exams", protect(["student"]), getAssignedExams);
router.get("/start/:examId", protect(["student"]), startExam);
router.post("/submit/:examId", protect(["student"]), submitExam);

module.exports = router;
