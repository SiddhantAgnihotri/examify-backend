const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getAssignedExams,
  startExam,
  submitExam,
  getExamSummary
} = require("../controllers/studentController");

// Student only
router.get("/exams", protect(["student"]), getAssignedExams);
router.get("/start/:examId", protect(["student"]), startExam);
router.post("/submit/:examId", protect(["student"]), submitExam);
router.get(
  "/exam-summary/:examId",
  protect(["student"]),
  getExamSummary
);


module.exports = router;
