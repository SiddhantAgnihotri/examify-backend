const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  addMCQ,
  getExamQuestions,
  deleteQuestion
} = require("../controllers/questionController");

// Teacher only
router.post("/mcq/:examId", protect(["teacher"]), addMCQ);
router.get("/:examId", protect(["teacher"]), getExamQuestions);
router.delete("/:questionId", protect(["teacher"]), deleteQuestion);

module.exports = router;
