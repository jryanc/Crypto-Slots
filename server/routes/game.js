const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

// @route   POST api/game/spin
// @desc    Spin the slot machine
// @access  Private
router.post(
  '/spin',
  [
    auth,
    body('betAmount', 'Bet amount is required').isNumeric(),
    body('machineId', 'Machine ID is required').not().isEmpty()
  ],
  gameController.spinSlotMachine
);

// @route   GET api/game/machines
// @desc    Get user's slot machines
// @access  Private
router.get('/machines', auth, gameController.getUserMachines);

// @route   GET api/game/machine/:id
// @desc    Get specific slot machine details
// @access  Private
router.get('/machine/:id', auth, gameController.getMachineDetails);

// @route   POST api/game/daily-bonus
// @desc    Claim daily bonus
// @access  Private
router.post('/daily-bonus', auth, gameController.claimDailyBonus);

// @route   GET api/game/leaderboard
// @desc    Get game leaderboard
// @access  Private
router.get('/leaderboard', auth, gameController.getLeaderboard);

// @route   GET api/game/history
// @desc    Get user's game history
// @access  Private
router.get('/history', auth, gameController.getGameHistory);

// @route   POST api/game/auto-spin
// @desc    Start auto-spin session
// @access  Private
router.post(
  '/auto-spin',
  [
    auth,
    body('betAmount', 'Bet amount is required').isNumeric(),
    body('spins', 'Number of spins is required').isInt({ min: 1, max: 100 }),
    body('machineId', 'Machine ID is required').not().isEmpty()
  ],
  gameController.startAutoSpin
);

// @route   POST api/game/stop-auto-spin
// @desc    Stop auto-spin session
// @access  Private
router.post('/stop-auto-spin', auth, gameController.stopAutoSpin);

// @route   GET api/game/jackpot
// @desc    Get current jackpot amount
// @access  Private
router.get('/jackpot', auth, gameController.getJackpotAmount);

// @route   GET api/game/symbols
// @desc    Get slot machine symbols and payouts
// @access  Private
router.get('/symbols', auth, gameController.getSymbolsAndPayouts);

module.exports = router;