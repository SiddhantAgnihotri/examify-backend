const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ===============================
   CREATE STUDENT (Teacher only)
================================ */
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, userId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Student already exists" });
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
      student
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create student" });
  }
};

/* ===============================
   GET ALL STUDENTS (ONLY MINE)
================================ */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      createdBy: req.user.id // 🔒 FILTER
    }).select("-password");

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

/* ===============================
   GET SINGLE STUDENT (ONLY MINE)
================================ */
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
      createdBy: req.user.id
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
   UPDATE STUDENT (ONLY MINE)
================================ */
exports.updateStudent = async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student",
        createdBy: req.user.id
      },
      req.body,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student updated", student: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update student" });
  }
};

/* ===============================
   DELETE STUDENT (ONLY MINE)
================================ */
exports.deleteStudent = async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student",
      createdBy: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete student" });
  }
};
