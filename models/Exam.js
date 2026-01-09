const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    instituteName: {
      type: String,
      required: true,
      trim: true
    },

    examType: {
      type: String,
      enum: ["Practice", "Test", "Final"],
      default: "Practice"
    },

    subject: {
      type: String,
      trim: true
    },

    duration: {
      type: Number,
      required: true,
      min: 1
    },

    totalMarks: {
      type: Number,
      min: 0
    },

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true // 🔥 PERFORMANCE BOOST
    }
  },
  {
    timestamps: true // 🔥 VERY IMPORTANT
  }
);

module.exports = mongoose.model("Exam", ExamSchema);
