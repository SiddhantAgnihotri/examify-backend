const Exam = require("../models/Exam");
const User = require("../models/User");
const Submission = require("../models/Submission");
const Question = require("../models/Question");

/* ===============================
   CREATE EXAM (TEACHER)
================================ */
exports.createExam = async (req, res) => {
  const {
    title,
    instituteName,
    examType,
    subject,
    duration,
    totalMarks,
    startTime,
    endTime
  } = req.body;

  if (new Date(startTime) >= new Date(endTime)) {
    return res
      .status(400)
      .json({ message: "End time must be after start time" });
  }

  const exam = await Exam.create({
    title,
    instituteName,
    examType,
    subject,
    duration,
    totalMarks,
    startTime,
    endTime,
    createdBy: req.user.id,
    status: "draft"
  });

  res.status(201).json({
    message: "Exam created in draft mode",
    exam
  });
};


/* ===============================
   GET TEACHER EXAMS
================================ */
exports.getTeacherExams = async (req, res) => {
  const exams = await Exam.find({ createdBy: req.user.id });
  res.json(exams);
};

/* ===============================
   PUBLISH EXAM
================================ */
exports.publishExam = async (req, res) => {
  const exam = await Exam.findById(req.params.examId);

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  exam.status = "published";
  await exam.save();

  res.json({ message: "Exam published successfully" });
};

/* ===============================
   ASSIGN EXAM TO STUDENTS (FINAL)
================================ */
exports.assignExamToStudents = async (req, res) => {
  const { examId } = req.params;
  const { studentIds } = req.body;

  if (!studentIds || studentIds.length === 0) {
    return res
      .status(400)
      .json({ message: "No students selected" });
  }

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (exam.status !== "published") {
    return res
      .status(400)
      .json({ message: "Publish exam before assigning" });
  }

  // ✅ Assign exam to students (no duplicates)
  await User.updateMany(
    {
      _id: { $in: studentIds },
      role: "student"
    },
    {
      $addToSet: { assignedExams: examId }
    }
  );

  res.json({
    message: "Exam assigned successfully",
    assignedCount: studentIds.length
  });
};




exports.deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Only creator can delete
    if (exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ❌ Block if submissions exist
    const submissionsCount = await Submission.countDocuments({ examId });
    if (submissionsCount > 0) {
      return res.status(400).json({
        message: "Cannot delete exam. Students have already submitted."
      });
    }

    // 🧹 Remove exam from students
    await User.updateMany(
      { assignedExams: examId },
      { $pull: { assignedExams: examId } }
    );

    // 🧹 Delete questions
    await Question.deleteMany({ examId });

    // 🗑 Delete exam
    await Exam.findByIdAndDelete(examId);

    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete exam" });
  }
};
