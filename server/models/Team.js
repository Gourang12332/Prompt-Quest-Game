const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamName: String,
  members: [String],
  totalPoints: { type: Number, default: 1500 },
  attemptsPurchased: { type: Number, default: 0 },
  powerUpsUsed: {
    timeBoosts: { type: Number, default: 0 },
    freeHints: { type: Number, default: 0 }
  },
  currentLevel: { type: Number, default: 0 },
  solvedQuestionsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', TeamSchema);