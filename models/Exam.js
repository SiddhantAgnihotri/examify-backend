const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  title: String,
  instituteName: String,
  examType: String,
  subject: String,
  duration: Number,
  totalMarks: Number,

  startTime: Date,   // 🔥 NEW
  endTime: Date,     // 🔥 NEW

  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Exam", ExamSchema);
