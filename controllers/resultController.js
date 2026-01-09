const Submission = require("../models/Submission");
const Exam = require("../models/Exam");

/* ===============================
   STUDENT: MY RESULTS
================================ */
const getMyResults = async (req, res) => {
  try {
    const results = await Submission.find({
      studentId: req.user.id,
      status: "checked"
    })
      .populate("examId", "title subject examType")
      .select("obtainedMarks totalMarks createdAt");

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch results" });
  }
};

/* ===============================
   TEACHER: EXAM SUBMISSIONS
================================ */
const getExamSubmissions = async (req, res) => {
  try {
    const { examId } = req.params;

    const submissions = await Submission.find({ examId })
      .populate("studentId", "name userId")
      .select("obtainedMarks totalMarks status createdAt");

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

/* ===============================
   TEACHER: SINGLE SUBMISSION
================================ */
const getSingleSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate("studentId", "name userId")
      .populate("examId", "title");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submission" });
  }
};

/* ===============================
   ✅ EXPLICIT EXPORT (IMPORTANT)
================================ */
module.exports = {
  getMyResults,
  getExamSubmissions,
  getSingleSubmission
};
