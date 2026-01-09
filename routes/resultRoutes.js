const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const resultController = require("../controllers/resultController");

// Student
router.get(
  "/my-results",
  protect(["student"]),
  resultController.getMyResults
);

// Teacher
router.get(
  "/exam/:examId",
  protect(["teacher"]),
  resultController.getExamSubmissions
);

router.get(
  "/submission/:submissionId",
  protect(["teacher"]),
  resultController.getSingleSubmission
);

module.exports = router;
