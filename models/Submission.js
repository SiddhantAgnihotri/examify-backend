const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question"
        },
        selectedOption: String
      }
    ],

    totalMarks: Number,
    obtainedMarks: Number,

    status: {
      type: String,
      enum: ["in-progress", "checked"],
      default: "in-progress"
    }
  },
  { timestamps: true }
);

// 🚫 Prevent multiple attempts at DB level
SubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", SubmissionSchema);
