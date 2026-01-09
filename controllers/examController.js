const Exam = require("../models/Exam");
const User = require("../models/User");
const Submission = require("../models/Submission");
const Question = require("../models/Question");

/* ===============================
   CREATE EXAM (TEACHER)
================================ */
exports.createExam = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: "Failed to create exam" });
  }
};

/* ===============================
   GET TEACHER EXAMS
================================ */
exports.getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user.id });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch exams" });
  }
};

/* ===============================
   PUBLISH EXAM
================================ */
exports.publishExam = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: "Failed to publish exam" });
  }
};

/* ===============================
   ASSIGN EXAM TO STUDENTS (SECURE)
================================ */
exports.assignExamToStudents = async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "No students selected" });
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

    // 🔒 ONLY STUDENTS CREATED BY THIS TEACHER
    const validStudents = await User.find({
      _id: { $in: studentIds },
      role: "student",
      createdBy: req.user.id
    });

    if (validStudents.length !== studentIds.length) {
      return res.status(403).json({
        message: "Some students do not belong to you"
      });
    }

    await User.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { assignedExams: examId } }
    );

    res.json({
      message: "Exam assigned successfully",
      assignedCount: studentIds.length
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign exam" });
  }
};

/* ===============================
   DELETE EXAM (SAFE)
================================ */
exports.deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const submissionsCount = await Submission.countDocuments({ examId });
    if (submissionsCount > 0) {
      return res.status(400).json({
        message: "Cannot delete exam. Students have already submitted."
      });
    }

    await User.updateMany(
      { assignedExams: examId },
      { $pull: { assignedExams: examId } }
    );

    await Question.deleteMany({ examId });
    await Exam.findByIdAndDelete(examId);

    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete exam" });
  }
};
