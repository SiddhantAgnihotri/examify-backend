const Submission = require("../models/Submission");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const User = require("../models/User");

/* ===============================
   STUDENT: RESULT LIST
================================ */
exports.getMyResults = async (req, res) => {
  const results = await Submission.find({
    studentId: req.user.id,
    status: "checked"
  })
    .populate("examId", "title subject examType")
    .select("obtainedMarks totalMarks createdAt");

  res.json(results);
};


/* ===============================
   TEACHER: EXAM SUBMISSIONS
================================ */
exports.getExamSubmissions = async (req, res) => {
  const { examId } = req.params;

  const submissions = await Submission.find({ examId })
    .populate("studentId", "name userId")
    .select("obtainedMarks totalMarks status createdAt");

  res.json(submissions);
};

/* ===============================
   TEACHER: BASIC SUBMISSION
================================ */
exports.getSingleSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.submissionId)
    .populate("studentId", "name userId")
    .populate("examId", "title");

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  res.json(submission);
};

/* ===============================
   TEACHER: FULL ANSWER SHEET
================================ */
exports.getSubmissionDetailsTeacher = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate("studentId", "name userId")
      .populate("examId", "title subject");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const questions = await Question.find({
      examId: submission.examId._id
    });

    const answersMap = {};
    submission.answers.forEach(a => {
      answersMap[a.questionId.toString()] = a.selectedOption;
    });

    const detailedQuestions = questions.map(q => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedOption: answersMap[q._id.toString()] || null,
      marks: q.marks,
      isCorrect:
        answersMap[q._id.toString()] === q.correctAnswer
    }));

    res.json({
      student: submission.studentId,
      exam: submission.examId,
      questions: detailedQuestions,
      obtainedMarks: submission.obtainedMarks,
      totalMarks: submission.totalMarks
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load submission details" });
  }
};
