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

        // MCQ → A/B/C/D
        // Short/Long → text
        // File → file path
        selectedOption: String,

        // Teacher-awarded marks
        obtainedMarks: {
          type: Number,
          default: 0
        }
      }
    ],

    totalMarks: Number,
    obtainedMarks: Number,

    status: {
      type: String,
      enum: ["in-progress", "pending", "checked"],
      default: "in-progress"
    },

    isManuallyChecked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

SubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", SubmissionSchema);
