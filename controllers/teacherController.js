const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ===============================
   CREATE STUDENT (TEACHER ONLY)
================================ */
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, userId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      email,
      userId,
      password: hashedPassword,
      role: "student",
      createdBy: req.user.id // 🔒 LINK TO TEACHER
    });

    res.status(201).json({
      message: "Student created successfully",
      studentId: student._id
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create student" });
  }
};

/* ===============================
   GET ALL STUDENTS (TEACHER ONLY)
================================ */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      createdBy: req.user.id // 🔒 ONLY OWN STUDENTS
    }).select("name email userId");

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

/* ===============================
   GET STUDENT BY ID
================================ */
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
      createdBy: req.user.id // 🔒 OWNERSHIP CHECK
    }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch student" });
  }
};

/* ===============================
   UPDATE STUDENT
================================ */
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, userId } = req.body;

    const student = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student",
        createdBy: req.user.id // 🔒 PREVENT CROSS-TEACHER UPDATE
      },
      { name, email, userId },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update student" });
  }
};

/* ===============================
   DELETE STUDENT
================================ */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student",
      createdBy: req.user.id // 🔒 PREVENT CROSS-TEACHER DELETE
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete student" });
  }
};
