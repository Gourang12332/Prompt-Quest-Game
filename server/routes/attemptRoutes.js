const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');

// Create or get attempt for a question
router.post('/get-or-create', attemptController.getOrCreateAttempt);

// Submit answer
router.post('/submit', attemptController.submitAnswer);

// Buy additional attempts
router.post('/buy-attempts', attemptController.buyAttempts);

// Get hint for a question
router.post('/hint', attemptController.getHint);

module.exports = router;