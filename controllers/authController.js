const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * ==============================
 * TEACHER SELF REGISTRATION
 * ==============================
 * Public API
 * Role: teacher only
 */
exports.registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher"
    });

    res.status(201).json({
      message: "Teacher registered successfully"
    });
  } catch (error) {
    console.error("Register Teacher Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ==============================
 * LOGIN (TEACHER & STUDENT)
 * ==============================
 * Public API
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "JWT secret not configured" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ==============================
 * CHANGE PASSWORD
 * ==============================
 * Protected API
 * Teacher & Student
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
