const Submission = require("../models/Submission");
const Exam = require("../models/Exam");

const getMyResults = async (req, res) => {
  const results = await Submission.find({
    studentId: req.user.id
  })
    .populate("examId", "title subject examType")
    .select("obtainedMarks totalMarks createdAt");

  res.json(results);
};

const getExamSubmissions = async (req, res) => {
  const { examId } = req.params;

  const submissions = await Submission.find({ examId })
    .populate("studentId", "name userId")
    .select("obtainedMarks totalMarks status createdAt");

  res.json(submissions);
};

const getSingleSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.submissionId)
    .populate("studentId", "name userId")
    .populate("examId", "title");

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  res.json(submission);
};

module.exports = {
  getMyResults,
  getExamSubmissions,
  getSingleSubmission
};
