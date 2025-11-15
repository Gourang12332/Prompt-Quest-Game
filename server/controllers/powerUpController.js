const PowerUp = require('../models/PowerUp');
const Team = require('../models/Team');

// Buy a power-up
exports.buyPowerUp = async (req, res) => {
  try {
    const { teamId, type, pointsToDeduct } = req.body;
    
    // Update team points
    const team = await Team.findByIdAndUpdate(
      teamId,
      { $inc: { totalPoints: -pointsToDeduct } },
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Increment power-up usage count
    if (type === 'timeBoost') {
      team.powerUpsUsed.timeBoosts += 1;
      await team.save();
    } else if (type === 'freeHint') {
      team.powerUpsUsed.freeHints += 1;
      await team.save();
    }
    
    // Create power-up record
    const powerUp = new PowerUp({
      teamId,
      type,
      isUsed: false
    });
    await powerUp.save();
    
    // Emit updated scoreboard
    const io = req.app.get('socketio');
    const teams = await Team.find().sort({ totalPoints: -1 });
    io.to('scoreboard').emit('scoreboard-update', teams);
    
    res.json({ team, powerUp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Use a power-up
exports.usePowerUp = async (req, res) => {
  try {
    const { powerUpId } = req.body;
    
    const powerUp = await PowerUp.findByIdAndUpdate(
      powerUpId,
      { isUsed: true, usedAt: Date.now() },
      { new: true }
    );
    
    if (!powerUp) {
      return res.status(404).json({ message: 'Power-up not found' });
    }
    
    res.json(powerUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};