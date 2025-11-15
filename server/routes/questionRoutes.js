const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Get questions by level
router.get('/:level', questionController.getQuestionsByLevel);

// Get all questions
router.get('/', questionController.getAllQuestions);

// Create a new question
router.post('/', questionController.createQuestion);

module.exports = router;