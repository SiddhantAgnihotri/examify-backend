const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createStudent, getAllStudents,updateStudent,deleteStudent,getStudentById } = require("../controllers/teacherController");

// Only teacher can access
router.post("/create-student", protect(["teacher"]), createStudent);
router.get("/students", protect(["teacher"]), getAllStudents);
router.put("/student/:id", protect(["teacher"]), updateStudent);
router.delete("/student/:id", protect(["teacher"]), deleteStudent);
router.get("/student/:id", protect(["teacher"]), getStudentById);


module.exports = router;
