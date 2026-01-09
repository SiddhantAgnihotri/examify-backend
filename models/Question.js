const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true
  },

  type: {
    type: String,
    enum: ["mcq"],
    required: true
  },

  questionText: {
    type: String,
    required: true
  },

  options: {
    A: String,
    B: String,
    C: String,
    D: String
  },

  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"]
  },

  marks: {
    type: Number,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
