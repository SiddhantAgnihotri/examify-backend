const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true
  },

  userId: {
    type: String // optional student code like STU001
  },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["teacher", "student"],
    required: true
  },

  assignedExams: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Exam" }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
