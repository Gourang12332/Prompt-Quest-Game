const Team = require('../models/Team');

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { teamName, members } = req.body;
    
    // Check if team already exists
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }
    
    // Create new team with members
    const team = new Team({ 
      teamName,
      members: members || []
    });
    await team.save();
    
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team by ID
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update team points
exports.updateTeamPoints = async (req, res) => {
  try {
    const { teamId, points } = req.body;
    const team = await Team.findByIdAndUpdate(
      teamId,
      { $inc: { totalPoints: points } },
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Emit updated scoreboard
    const io = req.app.get('socketio');
    const teams = await Team.find().sort({ totalPoints: -1 });
    io.to('scoreboard').emit('scoreboard-update', teams);
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teams for scoreboard
exports.getScoreboard = async (req, res) => {
  try {
    const teams = await Team.find().sort({ totalPoints: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update team level
exports.updateTeamLevel = async (req, res) => {
  try {
    const { teamId, level } = req.body;
    const team = await Team.findByIdAndUpdate(
      teamId,
      { currentLevel: level },
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update solved questions count
exports.updateSolvedQuestions = async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await Team.findByIdAndUpdate(
      teamId,
      { $inc: { solvedQuestionsCount: 1 } },
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Emit updated scoreboard
    const io = req.app.get('socketio');
    const teams = await Team.find().sort({ totalPoints: -1 });
    io.to('scoreboard').emit('scoreboard-update', teams);
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};