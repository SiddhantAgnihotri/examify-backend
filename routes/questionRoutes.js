const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  addMCQ,
  addShortQuestion,
  addLongQuestion,
  addFileQuestion,
  getExamQuestions,
  deleteQuestion
} = require("../controllers/questionController");

// ===============================
// ADD QUESTIONS (TEACHER ONLY)
// ===============================

// MCQ
router.post(
  "/mcq/:examId",
  protect(["teacher"]),
  addMCQ
);

// Short Answer
router.post(
  "/short/:examId",
  protect(["teacher"]),
  addShortQuestion
);

// Long Answer
router.post(
  "/long/:examId",
  protect(["teacher"]),
  addLongQuestion
);

// File / Assignment
router.post(
  "/file/:examId",
  protect(["teacher"]),
  addFileQuestion
);

// ===============================
// GET & DELETE
// ===============================
router.get(
  "/:examId",
  protect(["teacher"]),
  getExamQuestions
);

router.delete(
  "/:questionId",
  protect(["teacher"]),
  deleteQuestion
);

module.exports = router;
