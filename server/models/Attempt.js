const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  teamId: mongoose.Schema.Types.ObjectId,
  questionId: mongoose.Schema.Types.ObjectId,
  attemptsLeft: Number,
  isLocked: Boolean,
  isSolved: Boolean,
  hasSeenHint: Boolean,
  usedFreeHint: Boolean,
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', AttemptSchema);