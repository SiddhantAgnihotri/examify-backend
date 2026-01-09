const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createExam,
  getTeacherExams,
  publishExam,
  assignExamToStudents
} = require("../controllers/examController");

const { deleteExam } = require("../controllers/examController");

/* ===============================
   TEACHER EXAM ROUTES
================================ */

// Create exam (draft)
router.post(
  "/create",
  protect(["teacher"]),
  createExam
);

// Get all exams created by teacher
router.get(
  "/my-exams",
  protect(["teacher"]),
  getTeacherExams
);

// Publish exam
router.put(
  "/publish/:examId",
  protect(["teacher"]),
  publishExam
);

// Assign exam to students
router.post(
  "/assign/:examId",
  protect(["teacher"]),
  assignExamToStudents
);

router.delete(
  "/delete/:examId",
  protect(["teacher"]),
  deleteExam
);

module.exports = router;
