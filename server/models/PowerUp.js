const mongoose = require('mongoose');

const PowerUpSchema = new mongoose.Schema({
  teamId: mongoose.Schema.Types.ObjectId,
  type: String,
  isUsed: Boolean,
  usedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PowerUp', PowerUpSchema);