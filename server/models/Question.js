const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  level: Number,
  difficulty: String,
  keywords: [String],
  fullQuestion: String,
  answer: String,
  points: Number,
  hint: String
});

module.exports = mongoose.model('Question', QuestionSchema);