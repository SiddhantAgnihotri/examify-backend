const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getAssignedExams,
  startExam,
  submitExam,
  getExamSummary,
  getPendingResults   // ✅ ADD THIS
} = require("../controllers/studentController");

// ===============================
// STUDENT ROUTES
// ===============================

router.get("/exams", protect(["student"]), getAssignedExams);

router.get("/start/:examId", protect(["student"]), startExam);

router.post("/submit/:examId", protect(["student"]), submitExam);

router.get(
  "/exam-summary/:examId",
  protect(["student"]),
  getExamSummary
);

router.get(
  "/pending-results",
  protect(["student"]),
  getPendingResults     // ✅ USE DIRECTLY
);

module.exports = router;
