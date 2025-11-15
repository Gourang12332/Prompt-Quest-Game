const Attempt = require('../models/Attempt');
const Team = require('../models/Team');

// Create or get attempt for a question
exports.getOrCreateAttempt = async (req, res) => {
  try {
    const { teamId, questionId } = req.body;
    
    // Check if attempt already exists
    let attempt = await Attempt.findOne({ teamId, questionId });
    
    if (!attempt) {
      // Create new attempt with 3 tries
      attempt = new Attempt({
        teamId,
        questionId,
        attemptsLeft: 3,
        isLocked: false,
        isSolved: false,
        hasSeenHint: false,
        usedFreeHint: false
      });
      await attempt.save();
    }
    
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit answer
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, answer, correctAnswer, points, teamId } = req.body;
    
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    if (attempt.isLocked || attempt.isSolved) {
      return res.status(400).json({ message: 'Attempt is locked or already solved' });
    }
    
    // Check answer
    const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      // Mark as solved and award points
      attempt.isSolved = true;
      attempt.attemptsLeft = 0;
      await attempt.save();
      
      // Update team points
      const team = await Team.findByIdAndUpdate(
        teamId,
        { $inc: { totalPoints: points } },
        { new: true }
      );
      
      // Emit updated scoreboard
      const io = req.app.get('socketio');
      const teams = await Team.find().sort({ totalPoints: -1 });
      io.to('scoreboard').emit('scoreboard-update', teams);
      
      return res.json({ 
        correct: true, 
        message: 'Correct answer!', 
        attempt,
        team
      });
    } else {
      // Decrement attempts
      attempt.attemptsLeft -= 1;
      
      if (attempt.attemptsLeft <= 0) {
        attempt.isLocked = true;
      }
      
      await attempt.save();
      
      return res.json({ 
        correct: false, 
        message: 'Incorrect answer. Try again!', 
        attempt
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buy additional attempts
exports.buyAttempts = async (req, res) => {
  try {
    const { teamId, attemptId, pointsToDeduct } = req.body;
    
    // Update team points
    const team = await Team.findByIdAndUpdate(
      teamId,
      { 
        $inc: { totalPoints: -pointsToDeduct, attemptsPurchased: 1 } 
      },
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Unlock attempt and add tries
    const attempt = await Attempt.findByIdAndUpdate(
      attemptId,
      { 
        isLocked: false,
        $inc: { attemptsLeft: 3 }
      },
      { new: true }
    );
    
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    // Emit updated scoreboard
    const io = req.app.get('socketio');
    const teams = await Team.find().sort({ totalPoints: -1 });
    io.to('scoreboard').emit('scoreboard-update', teams);
    
    res.json({ team, attempt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hint for a question
exports.getHint = async (req, res) => {
  try {
    const { attemptId, useFreeHint } = req.body;
    
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    // Update attempt to mark hint as seen
    attempt.hasSeenHint = true;
    
    if (useFreeHint) {
      attempt.usedFreeHint = true;
    }
    
    await attempt.save();
    
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};