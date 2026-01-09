const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Create Student (Teacher only)
exports.createStudent = async (req, res) => {
  const { name, email, password, userId } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const student = await User.create({
    name,
    email,
    userId, // optional student code
    password: hashedPassword,
    role: "student"
  });

  res.status(201).json({
    message: "Student created successfully",
    email: student.email
  });
};


exports.getAllStudents = async (req, res) => {
  const students = await User.find({ role: "student" })
    .select("name email userId");
  res.json(students);
};


exports.getStudentById = async (req, res) => {
  const student = await User.findById(req.params.id).select("-password");
  res.json(student);
};

exports.updateStudent = async (req, res) => {
  const { name, email, userId } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email, userId });
  res.json({ message: "Student updated" });
};

exports.deleteStudent = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
};

