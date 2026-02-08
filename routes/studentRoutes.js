const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadSubmission");

const {
  getAssignedExams,
  startExam,
  submitExam,
  getExamSummary,
  getPendingResults,
  uploadFileAnswer   // ✅ IMPORT PROPERLY
} = require("../controllers/studentController");

// ===============================
// STUDENT ROUTES
// ===============================

// Assigned exams
router.get("/exams", protect(["student"]), getAssignedExams);

// Start / resume exam
router.get("/start/:examId", protect(["student"]), startExam);

// Submit exam
router.post("/submit/:examId", protect(["student"]), submitExam);

// Upload file answer (FILE type questions)
router.post(
  "/upload/:examId/:questionId",
  protect(["student"]),
  upload.single("file"),
  uploadFileAnswer   // ✅ USE DIRECT FUNCTION
);

// Exam summary
router.get(
  "/exam-summary/:examId",
  protect(["student"]),
  getExamSummary
);

// Pending results (manual exams)
router.get(
  "/pending-results",
  protect(["student"]),
  getPendingResults
);

module.exports = router;
