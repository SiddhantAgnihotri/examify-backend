const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const User = require("../models/User");

/* ===============================
   GET ASSIGNED EXAMS
================================ */
exports.getAssignedExams = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const exams = await Exam.find({
      _id: { $in: user.assignedExams },
      status: "published"
    });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch exams" });
  }
};

/* ===============================
   START / RESUME EXAM
================================ */
exports.startExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // ❌ BLOCK IF ALREADY SUBMITTED
    const alreadySubmitted = await Submission.findOne({
      examId,
      studentId: req.user.id,
      status: "checked"
    });

    if (alreadySubmitted) {
      return res
        .status(403)
        .json({ message: "Exam already submitted" });
    }

    const exam = await Exam.findById(examId);
    if (!exam || exam.status !== "published") {
      return res.status(404).json({ message: "Exam not available" });
    }

    const now = new Date();
    if (now < exam.startTime) {
      return res.status(403).json({ message: "Exam not started yet" });
    }
    if (now > exam.endTime) {
      return res.status(403).json({ message: "Exam time is over" });
    }

    const user = await User.findById(req.user.id);
    if (!user.assignedExams.includes(examId)) {
      return res.status(403).json({ message: "Exam not assigned" });
    }

    // 🔄 FIND OR CREATE IN-PROGRESS SUBMISSION
    let submission = await Submission.findOne({
      examId,
      studentId: req.user.id
    });

    if (!submission) {
      submission = await Submission.create({
        examId,
        studentId: req.user.id,
        answers: [],
        status: "in-progress"
      });
    }

    const questions = await Question.find(
      { examId },
      { correctAnswer: 0 }
    );

    res.json({
      questions,
      previousAnswers: submission.answers
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to start exam" });
  }
};

/* ===============================
   SUBMIT EXAM (FINAL)
================================ */
exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;

    const submission = await Submission.findOne({
      examId,
      studentId: req.user.id
    });

    if (!submission || submission.status === "checked") {
      return res
        .status(400)
        .json({ message: "Invalid submission" });
    }

    const questions = await Question.find({ examId });

    let obtainedMarks = 0;
    let totalMarks = 0;

    questions.forEach((q) => {
      totalMarks += q.marks;
      const ans = answers.find(
        (a) => a.questionId === q._id.toString()
      );
      if (ans && ans.selectedOption === q.correctAnswer) {
        obtainedMarks += q.marks;
      }
    });

    submission.answers = answers;
    submission.totalMarks = totalMarks;
    submission.obtainedMarks = obtainedMarks;
    submission.status = "checked";

    await submission.save();

    res.json({
      message: "Exam submitted successfully",
      obtainedMarks,
      totalMarks
    });
  } catch (err) {
    res.status(500).json({ message: "Submission failed" });
  }
};
