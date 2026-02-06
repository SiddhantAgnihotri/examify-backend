const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const User = require("../models/User");

/* ===============================
   GET ASSIGNED EXAMS
================================ */
exports.getAssignedExams = async (req, res) => {
  const student = await User.findById(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const exams = await Exam.find({
    _id: { $in: student.assignedExams },
    status: "published",
    createdBy: student.createdBy
  });

  res.json(exams);
};

/* ===============================
   START / RESUME EXAM
================================ */
exports.startExam = async (req, res) => {
  const { examId } = req.params;

  const student = await User.findById(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // 🚫 Block if already submitted (checked OR pending)
  const alreadySubmitted = await Submission.findOne({
    examId,
    studentId: req.user.id,
    status: { $in: ["checked", "pending"] }
  });

  if (alreadySubmitted) {
    return res.status(403).json({
      message: "You have already submitted this exam"
    });
  }

  const exam = await Exam.findOne({
    _id: examId,
    status: "published",
    createdBy: student.createdBy
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not available" });
  }

  const now = new Date();
  if (now < exam.startTime)
    return res.status(403).json({ message: "Exam not started yet" });
  if (now > exam.endTime)
    return res.status(403).json({ message: "Exam time is over" });

  if (!student.assignedExams.includes(examId)) {
    return res.status(403).json({ message: "Exam not assigned" });
  }

  // Resume / create submission
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
    previousAnswers: submission.answers,
    duration: exam.duration
  });
};

/* ===============================
   SUBMIT EXAM
================================ */
exports.submitExam = async (req, res) => {
  const { examId } = req.params;
  const { answers } = req.body;

  const student = await User.findById(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

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

  if (!submission || submission.status !== "in-progress") {
    return res.status(400).json({ message: "Invalid submission" });
  }

  const questions = await Question.find({ examId });

  let totalMarks = 0;
  let obtainedMarks = 0;

  const formattedAnswers = [];

  for (const q of questions) {
    totalMarks += q.marks;

    const ans = answers.find(
      a => a.questionId === q._id.toString()
    );

    const answerValue = ans ? ans.selectedOption : null;
    let marksForThis = 0;

    // ✅ Auto-check only MCQ
    if (q.type === "mcq" && answerValue === q.correctAnswer) {
      marksForThis = q.marks;
      obtainedMarks += q.marks;
    }

    formattedAnswers.push({
      questionId: q._id,
      selectedOption: answerValue,
      obtainedMarks: marksForThis
    });
  }

  submission.answers = formattedAnswers;
  submission.totalMarks = totalMarks;
  submission.obtainedMarks = obtainedMarks;

  if (exam.evaluationType === "manual") {
    submission.status = "pending";
    submission.isManuallyChecked = false;
  } else {
    submission.status = "checked";
    submission.isManuallyChecked = true;
  }

  await submission.save();

  res.json({
    message:
      exam.evaluationType === "manual"
        ? "Exam submitted. Result will be available after evaluation."
        : "Exam submitted successfully",
    obtainedMarks,
    totalMarks,
    status: submission.status
  });
};

/* ===============================
   EXAM SUMMARY
================================ */
exports.getExamSummary = async (req, res) => {
  const { examId } = req.params;

  const student = await User.findById(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const exam = await Exam.findOne({
    _id: examId,
    status: "published",
    createdBy: student.createdBy
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not available" });
  }

  const submission = await Submission.findOne({
    examId,
    studentId: req.user.id
  });

  if (submission && ["checked", "pending"].includes(submission.status)) {
    return res.status(403).json({
      message: "You have already submitted this exam"
    });
  }

  const totalQuestions = await Question.countDocuments({ examId });

  res.json({
    title: exam.title,
    subject: exam.subject,
    instituteName: exam.instituteName,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    totalQuestions,
    startTime: exam.startTime,
    endTime: exam.endTime,
    evaluationType: exam.evaluationType
  });
};
