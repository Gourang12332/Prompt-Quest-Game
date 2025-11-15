const express = require('express');
const router = express.Router();
const powerUpController = require('../controllers/powerUpController');

// Buy a power-up
router.post('/buy', powerUpController.buyPowerUp);

// Use a power-up
router.put('/use', powerUpController.usePowerUp);

module.exports = router;