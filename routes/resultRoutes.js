const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getMyResults,
  getExamSubmissions,
  getSingleSubmission,
  getMySubmissionDetails,      // 🆕 student
  getSubmissionDetailsTeacher  // 🆕 teacher
} = require("../controllers/resultController");

/* ===============================
   STUDENT ROUTES
================================ */

// Student result list
router.get(
  "/my-results",
  protect(["student"]),
  getMyResults
);

// 🆕 Student: view own answer sheet
router.get(
  "/my-submission/:examId",
  protect(["student"]),
  getMySubmissionDetails
);

/* ===============================
   TEACHER ROUTES
================================ */

// Teacher: all submissions of an exam
router.get(
  "/exam/:examId",
  protect(["teacher"]),
  getExamSubmissions
);

// Teacher: basic submission info
router.get(
  "/submission/:submissionId",
  protect(["teacher"]),
  getSingleSubmission
);

// 🆕 Teacher: full answer sheet
router.get(
  "/submission/:submissionId/details",
  protect(["teacher"]),
  getSubmissionDetailsTeacher
);

module.exports = router;
