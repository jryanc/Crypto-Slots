const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getUserProfile);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    body('username', 'Username is required').optional(),
    body('email', 'Please include a valid email').optional().isEmail()
  ],
  userController.updateUserProfile
);

// @route   GET api/users/stats
// @desc    Get user game stats
// @access  Private
router.get('/stats', auth, userController.getUserStats);

// @route   GET api/users/transactions
// @desc    Get user transaction history
// @access  Private
router.get('/transactions', auth, userController.getUserTransactions);

// @route   GET api/users/wallet
// @desc    Get user wallet information
// @access  Private
router.get('/wallet', auth, userController.getUserWallet);

// @route   POST api/users/wallet/connect
// @desc    Connect external wallet
// @access  Private
router.post(
  '/wallet/connect',
  [
    auth,
    body('walletAddress', 'Wallet address is required').not().isEmpty(),
    body('walletType', 'Wallet type is required').not().isEmpty()
  ],
  userController.connectWallet
);

// @route   GET api/users/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', auth, userController.getUserAchievements);

// @route   POST api/users/feedback
// @desc    Submit user feedback
// @access  Private
router.post(
  '/feedback',
  [
    auth,
    body('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
    body('comment', 'Comment is required').optional()
  ],
  userController.submitFeedback
);

// @route   DELETE api/users
// @desc    Delete user account
// @access  Private
router.delete('/', auth, userController.deleteAccount);

module.exports = router;