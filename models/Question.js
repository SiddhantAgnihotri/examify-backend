const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true
    },

    /* ===============================
       QUESTION TYPE
       mcq | short | long | file
    ================================ */
    type: {
      type: String,
      enum: ["mcq", "short", "long", "file"],
      required: true
    },

    questionText: {
      type: String,
      required: true
    },

    /* ===============================
       MCQ FIELDS
    ================================ */
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

    /* ===============================
       SHORT ANSWER (OPTIONAL)
    ================================ */
    expectedAnswer: {
      type: String // optional, for reference or future auto-check
    },

    /* ===============================
       FILE UPLOAD QUESTION
    ================================ */
    allowedFileTypes: {
      type: [String], // e.g. ["pdf", "docx", "zip"]
      default: []
    },

    maxFileSizeMB: {
      type: Number,
      default: 10
    },

    /* ===============================
       COMMON
    ================================ */
    marks: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
