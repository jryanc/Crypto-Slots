const { validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const CryptoWallet = require('../models/CryptoWallet');
const Achievement = require('../models/Achievement');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user profile error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, email, avatar } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username is taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }
    
    // Check if email is taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    
    // Update avatar if provided
    if (avatar) {
      user.avatar = avatar;
    }
    
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error('Update user profile error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get user game stats
 * @route   GET /api/users/stats
 * @access  Private
 */
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.gameStats);
  } catch (err) {
    console.error('Get user stats error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get user transaction history
 * @route   GET /api/users/transactions
 * @access  Private
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { user: req.user.id };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get user transactions error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get user wallet information
 * @route   GET /api/users/wallet
 * @access  Private
 */
exports.getUserWallet = async (req, res) => {
  try {
    // Find user's crypto wallet
    let wallet = await CryptoWallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      // Create new wallet if not exists
      wallet = new CryptoWallet({
        user: req.user.id,
        balances: [{ cryptoType: 'bitcoin', amount: 0 }]
      });
      await wallet.save();
    }
    
    res.json(wallet);
  } catch (err) {
    console.error('Get user wallet error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Connect external wallet
 * @route   POST /api/users/wallet/connect
 * @access  Private
 */
exports.connectWallet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { walletAddress, walletType } = req.body;
  
  try {
    // Find user's crypto wallet
    let wallet = await CryptoWallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      // Create new wallet if not exists
      wallet = new CryptoWallet({
        user: req.user.id,
        balances: [{ cryptoType: 'bitcoin', amount: 0 }]
      });
    }
    
    // Check if wallet address already exists
    const existingWallet = wallet.externalWallets.find(
      w => w.address === walletAddress
    );
    
    if (existingWallet) {
      return res.status(400).json({ message: 'Wallet already connected' });
    }
    
    // Add external wallet
    wallet.externalWallets.push({
      name: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} Wallet`,
      address: walletAddress,
      walletType,
      isVerified: false
    });
    
    await wallet.save();
    
    // Update user
    const user = await User.findById(req.user.id);
    user.cryptoWallet = {
      connected: true,
      address: walletAddress,
      type: walletType
    };
    
    await user.save();
    
    res.json(wallet);
  } catch (err) {
    console.error('Connect wallet error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get user achievements
 * @route   GET /api/users/achievements
 * @access  Private
 */
exports.getUserAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get achievement details
    const achievementIds = user.achievements.map(a => a.achievementId);
    const achievements = await Achievement.find({ _id: { $in: achievementIds } });
    
    // Combine user achievement data with achievement details
    const userAchievements = user.achievements.map(userAchievement => {
      const achievementDetails = achievements.find(
        a => a._id.toString() === userAchievement.achievementId.toString()
      );
      
      return {
        ...userAchievement.toObject(),
        details: achievementDetails
      };
    });
    
    res.json(userAchievements);
  } catch (err) {
    console.error('Get user achievements error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Submit user feedback
 * @route   POST /api/users/feedback
 * @access  Private
 */
exports.submitFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { rating, comment } = req.body;
  
  try {
    // In a real app, this would save to a feedback collection
    // For this example, we'll just return success
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        user: req.user.id,
        rating,
        comment,
        date: new Date()
      }
    });
  } catch (err) {
    console.error('Submit feedback error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users
 * @access  Private
 */
exports.deleteAccount = async (req, res) => {
  try {
    // Delete user
    await User.findByIdAndDelete(req.user.id);
    
    // Delete user's crypto wallet
    await CryptoWallet.findOneAndDelete({ user: req.user.id });
    
    // Delete user's transactions
    await Transaction.deleteMany({ user: req.user.id });
    
    res.json({ message: 'User account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).send('Server error');
  }
};