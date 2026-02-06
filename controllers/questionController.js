const Question = require("../models/Question");
const Exam = require("../models/Exam");

/* ===============================
   COMMON EXAM VALIDATION
================================ */
const validateExamOwnership = async (examId, userId) => {
  const exam = await Exam.findById(examId);
  if (!exam) return null;
  if (exam.createdBy.toString() !== userId) return "unauthorized";
  return exam;
};

/* ===============================
   ADD MCQ (AUTO CHECK)
================================ */
exports.addMCQ = async (req, res) => {
  const { examId } = req.params;
  const { questionText, options, correctAnswer, marks } = req.body;

  const exam = await validateExamOwnership(examId, req.user.id);
  if (!exam)
    return res.status(404).json({ message: "Exam not found" });
  if (exam === "unauthorized")
    return res.status(403).json({ message: "Not authorized" });

  const question = await Question.create({
    examId,
    type: "mcq",
    questionText,
    options,
    correctAnswer,
    marks
  });

  res.status(201).json({
    message: "MCQ added (auto evaluated)",
    question
  });
};

/* ===============================
   ADD SHORT ANSWER (MANUAL)
================================ */
exports.addShortQuestion = async (req, res) => {
  const { examId } = req.params;
  const { questionText, expectedAnswer, marks } = req.body;

  const exam = await validateExamOwnership(examId, req.user.id);
  if (!exam)
    return res.status(404).json({ message: "Exam not found" });
  if (exam === "unauthorized")
    return res.status(403).json({ message: "Not authorized" });

  // 🔑 FORCE MANUAL EVALUATION
  exam.evaluationType = "manual";
  await exam.save();

  const question = await Question.create({
    examId,
    type: "short",
    questionText,
    expectedAnswer,
    marks
  });

  res.status(201).json({
    message: "Short answer added (manual evaluation enabled)",
    question
  });
};

/* ===============================
   ADD LONG ANSWER (MANUAL)
================================ */
exports.addLongQuestion = async (req, res) => {
  const { examId } = req.params;
  const { questionText, marks } = req.body;

  const exam = await validateExamOwnership(examId, req.user.id);
  if (!exam)
    return res.status(404).json({ message: "Exam not found" });
  if (exam === "unauthorized")
    return res.status(403).json({ message: "Not authorized" });

  // 🔑 FORCE MANUAL EVALUATION
  exam.evaluationType = "manual";
  await exam.save();

  const question = await Question.create({
    examId,
    type: "long",
    questionText,
    marks
  });

  res.status(201).json({
    message: "Long answer added (manual evaluation enabled)",
    question
  });
};

/* ===============================
   ADD FILE QUESTION (MANUAL)
================================ */
exports.addFileQuestion = async (req, res) => {
  const { examId } = req.params;
  const {
    questionText,
    allowedFileTypes,
    maxFileSizeMB,
    marks
  } = req.body;

  const exam = await validateExamOwnership(examId, req.user.id);
  if (!exam)
    return res.status(404).json({ message: "Exam not found" });
  if (exam === "unauthorized")
    return res.status(403).json({ message: "Not authorized" });

  // 🔑 FORCE MANUAL EVALUATION
  exam.evaluationType = "manual";
  await exam.save();

  const question = await Question.create({
    examId,
    type: "file",
    questionText,
    allowedFileTypes,
    maxFileSizeMB,
    marks
  });

  res.status(201).json({
    message: "File question added (manual evaluation enabled)",
    question
  });
};

/* ===============================
   GET EXAM QUESTIONS
================================ */
exports.getExamQuestions = async (req, res) => {
  const questions = await Question.find({
    examId: req.params.examId
  });

  res.json(questions);
};

/* ===============================
   DELETE QUESTION
================================ */
exports.deleteQuestion = async (req, res) => {
  const question = await Question.findById(req.params.questionId);

  if (!question)
    return res.status(404).json({ message: "Question not found" });

  await question.deleteOne();
  res.json({ message: "Question deleted" });
};
