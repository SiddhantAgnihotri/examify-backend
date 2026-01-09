const User = require("../models/User");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");

/* ===============================
   CREATE SINGLE STUDENT
================================ */
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, userId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 🔒 Unique per teacher
    const existing = await User.findOne({
      email,
      role: "student",
      createdBy: req.user.id
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Student with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      email,
      userId,
      password: hashedPassword,
      role: "student",
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Student created successfully",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        userId: student.userId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create student" });
  }
};

/* ===============================
   BULK UPLOAD STUDENTS (EXCEL / CSV)
================================ */
exports.bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let createdCount = 0;
    let skippedCount = 0;
    let errors = [];

    for (let i = 0; i < rows.length; i++) {
      const { name, email, password, userId } = rows[i];

      if (!name || !email || !password) {
        errors.push({
          row: i + 2,
          error: "Missing name / email / password"
        });
        continue;
      }

      const exists = await User.findOne({
        email,
        role: "student",
        createdBy: req.user.id
      });

      if (exists) {
        skippedCount++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        name,
        email,
        userId,
        password: hashedPassword,
        role: "student",
        createdBy: req.user.id
      });

      createdCount++;
    }

    res.json({
      message: "Bulk upload completed",
      totalRows: rows.length,
      createdCount,
      skippedCount,
      errorCount: errors.length,
      errors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Bulk upload failed" });
  }
};

/* ===============================
   GET ALL STUDENTS (ONLY MINE)
================================ */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      createdBy: req.user.id
    }).select("name email userId createdAt");

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
   UPDATE STUDENT
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
    );

    if (!updated) {
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
