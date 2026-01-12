const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getMyResults,
  getExamSubmissions,
  getSingleSubmission,
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
