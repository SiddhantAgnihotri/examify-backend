const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getMyResults,
  getExamSubmissions,
  getSingleSubmission
} = require("../controllers/resultController");

// Student
router.get("/my-results", protect(["student"]), getMyResults);

// Teacher
router.get("/exam/:examId", protect(["teacher"]), getExamSubmissions);
router.get("/submission/:submissionId", protect(["teacher"]), getSingleSubmission);

module.exports = router;
