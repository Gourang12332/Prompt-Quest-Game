const Question = require('../models/Question');

// Get questions by level
exports.getQuestionsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const questions = await Question.find({ level: parseInt(level) });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all questions (for seeding)
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new question (for seeding)
exports.createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};