const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, authController.getAuthUser);

// @route   POST api/auth/2fa/setup
// @desc    Set up two-factor authentication
// @access  Private
router.post('/2fa/setup', auth, authController.setup2FA);

// @route   POST api/auth/2fa/verify
// @desc    Verify two-factor authentication
// @access  Private
router.post('/2fa/verify', auth, authController.verify2FA);

// @route   POST api/auth/social
// @desc    Social media authentication
// @access  Public
router.post('/social', authController.socialAuth);

// @route   POST api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Public
router.post('/refresh-token', authController.refreshToken);

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  '/forgot-password',
  [body('email', 'Please include a valid email').isEmail()],
  authController.forgotPassword
);

// @route   POST api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password',
  [
    body('token', 'Token is required').not().isEmpty(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  authController.resetPassword
);

module.exports = router;