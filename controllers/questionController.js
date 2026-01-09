const Question = require("../models/Question");
const Exam = require("../models/Exam");

exports.addMCQ = async (req, res) => {
  const { examId } = req.params;
  const {
    questionText,
    options,
    correctAnswer,
    marks
  } = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const question = await Question.create({
    examId,
    type: "mcq",
    questionText,
    options,
    correctAnswer,
    marks
  });

  res.status(201).json({
    message: "MCQ added successfully",
    question
  });
};


exports.getExamQuestions = async (req, res) => {
  const questions = await Question.find({
    examId: req.params.examId
  });

  res.json(questions);
};


exports.deleteQuestion = async (req, res) => {
  const question = await Question.findById(req.params.questionId);

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  await question.deleteOne();
  res.json({ message: "Question deleted" });
};
