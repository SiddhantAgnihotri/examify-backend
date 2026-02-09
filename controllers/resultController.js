const Submission = require("../models/Submission");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

/* ===============================
   STUDENT: RESULT LIST
================================ */
exports.getMyResults = async (req, res) => {
  const results = await Submission.find({
    studentId: req.user.id,
    status: { $in: ["checked", "pending"] }
  })
    .populate("examId", "title subject examType evaluationType")
    .select("obtainedMarks totalMarks status createdAt");

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
  const submission = await Submission.findById(req.params.submissionId)
    .populate("studentId", "name userId")
    .populate("examId", "title subject evaluationType");

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  const questions = await Question.find({
    examId: submission.examId._id
  });

  const answersMap = {};
  submission.answers.forEach(a => {
    answersMap[a.questionId.toString()] = a;
  });

  const detailedQuestions = questions.map(q => {
    const answer = answersMap[q._id];

    return {
      _id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,

      // ✅ for short / long
      studentAnswer:
        q.type !== "file" ? answer?.selectedOption || null : null,

      // ✅ for file
      fileUrl:
        q.type === "file" ? answer?.selectedOption || null : null,

      obtainedMarks: answer?.obtainedMarks || 0,
      maxMarks: q.marks
    };
  });


  res.json({
    student: submission.studentId,
    exam: submission.examId,
    questions: detailedQuestions,
    obtainedMarks: submission.obtainedMarks,
    totalMarks: submission.totalMarks
  });
};

/* ===============================
   TEACHER: MANUAL EVALUATION
================================ */
exports.evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { answers } = req.body;
    // answers = [{ questionId, obtainedMarks }]

    const submission = await Submission.findById(submissionId)
      .populate("examId");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // 🔒 Teacher ownership check
    if (submission.examId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ❌ Auto exams cannot be manually evaluated
    if (submission.examId.evaluationType === "auto") {
      return res.status(400).json({
        message: "Auto-evaluated exams cannot be manually checked"
      });
    }

    let totalObtained = 0;

    submission.answers = submission.answers.map(a => {
      const updated = answers.find(
        x => x.questionId === a.questionId.toString()
      );

      if (updated) {
        a.obtainedMarks = Number(updated.obtainedMarks) || 0;
      }

      totalObtained += a.obtainedMarks || 0;
      return a;
    });

    submission.obtainedMarks = totalObtained;
    submission.status = "checked";
    submission.isManuallyChecked = true;

    await submission.save();

    res.json({
      message: "Submission evaluated successfully",
      obtainedMarks: submission.obtainedMarks,
      totalMarks: submission.totalMarks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Evaluation failed" });
  }
};
