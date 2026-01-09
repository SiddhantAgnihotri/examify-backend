const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const multer = require("multer");

const {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  getStudentById,
  bulkUploadStudents
} = require("../controllers/teacherController");

/* ===============================
   MULTER CONFIG (MEMORY)
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/* ===============================
   TEACHER → STUDENT ROUTES
================================ */

// ✅ Create single student
router.post(
  "/create-student",
  protect(["teacher"]),
  createStudent
);

// ✅ Bulk upload students (Excel / CSV)
router.post(
  "/students/bulk-upload",
  protect(["teacher"]),
  upload.single("file"),
  bulkUploadStudents
);

// ✅ Get all students (only logged-in teacher)
router.get(
  "/students",
  protect(["teacher"]),
  getAllStudents
);

// ✅ Get single student
router.get(
  "/student/:id",
  protect(["teacher"]),
  getStudentById
);

// ✅ Update student
router.put(
  "/student/:id",
  protect(["teacher"]),
  updateStudent
);

// ✅ Delete student
router.delete(
  "/student/:id",
  protect(["teacher"]),
  deleteStudent
);

module.exports = router;
