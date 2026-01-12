const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const User = require("../models/User");

/* ===============================
   GET ASSIGNED EXAMS (SECURE)
================================ */
exports.getAssignedExams = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔒 Only exams created by student's teacher
    const exams = await Exam.find({
      _id: { $in: student.assignedExams },
      status: "published",
      createdBy: student.createdBy
    });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch exams" });
  }
};

/* ===============================
   START / RESUME EXAM (SECURE)
================================ */
exports.startExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ❌ Already submitted
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

    // 🔒 Exam must belong to same teacher
    const exam = await Exam.findOne({
      _id: examId,
      status: "published",
      createdBy: student.createdBy
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not available" });
    }

    const now = new Date();
    if (now < exam.startTime) {
      return res.status(403).json({ message: "Exam not started yet" });
    }
    if (now > exam.endTime) {
      return res.status(403).json({ message: "Exam time is over" });
    }

    if (!student.assignedExams.includes(examId)) {
      return res.status(403).json({ message: "Exam not assigned" });
    }

    // 🔄 Resume / Create submission
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
   SUBMIT EXAM (SECURE)
================================ */
exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;

    const student = await User.findById(req.user.id);

    const exam = await Exam.findOne({
      _id: examId,
      createdBy: student.createdBy
    });

    if (!exam) {
      return res.status(403).json({ message: "Invalid exam" });
    }

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


/* ===============================
   EXAM SUMMARY (BEFORE START)
================================ */
exports.getExamSummary = async (req, res) => {
  try {
    const { examId } = req.params;

    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Exam must belong to same teacher
    const exam = await Exam.findOne({
      _id: examId,
      status: "published",
      createdBy: student.createdBy
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not available" });
    }

    if (!student.assignedExams.includes(examId)) {
      return res.status(403).json({ message: "Exam not assigned" });
    }

    // Check submission status
    const submission = await Submission.findOne({
      examId,
      studentId: req.user.id
    });

    const now = new Date();
    let examStatus = "Active";
    if (now < exam.startTime) examStatus = "Upcoming";
    if (now > exam.endTime) examStatus = "Expired";

    const totalQuestions = await Question.countDocuments({ examId });

    res.json({
      title: exam.title,
      subject: exam.subject,
      instituteName: exam.instituteName, // ✅ IMPORTANT
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      totalQuestions,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: examStatus,
      alreadySubmitted: submission?.status === "checked"
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load exam summary" });
  }
};
