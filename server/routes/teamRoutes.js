const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Create a new team
router.post('/', teamController.createTeam);

// Get team by ID
router.get('/:id', teamController.getTeam);

// Update team points
router.put('/points', teamController.updateTeamPoints);

// Get all teams for scoreboard
router.get('/', teamController.getScoreboard);

// Update team level
router.put('/level', teamController.updateTeamLevel);

// Update solved questions count
router.put('/solved-questions', teamController.updateSolvedQuestions);

module.exports = router;