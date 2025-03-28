const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username is taken
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create default machine for user
    const Machine = require('../models/Machine');
    const defaultMachine = new Machine({
      name: 'Basic Slot Machine',
      description: 'Your first slot machine',
      owner: user._id,
      type: 'basic'
    });
    await defaultMachine.save();

    // Add machine to user
    user.machines.push(defaultMachine._id);
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Check if 2FA is enabled
    if (user.twoFactorAuth && user.twoFactorAuth.enabled) {
      // Return token with 2FA flag
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5m' }, // Short expiration for 2FA verification
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            requiresTwoFactor: true
          });
        }
      );
    } else {
      // Return full token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
        (err, token) => {
          if (err) throw err;
          
          // Update last login
          user.lastLogin = Date.now();
          user.save();
          
          res.json({ token });
        }
      );
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get authenticated user
 * @route   GET /api/auth
 * @access  Private
 */
exports.getAuthUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('machines', 'name type level image');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get auth user error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Set up two-factor authentication
 * @route   POST /api/auth/2fa/setup
 * @access  Private
 */
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `CryptoSlots:${user.email}`
    });
    
    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex'));
    }
    
    // Save secret and backup codes to user
    user.twoFactorAuth = {
      enabled: false, // Will be enabled after verification
      secret: secret.base32,
      backupCodes
    };
    
    await user.save();
    
    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes
    });
  } catch (err) {
    console.error('Setup 2FA error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Verify two-factor authentication
 * @route   POST /api/auth/2fa/verify
 * @access  Private
 */
exports.verify2FA = async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    
    // If 2FA is not set up
    if (!user.twoFactorAuth || !user.twoFactorAuth.secret) {
      return res.status(400).json({ message: '2FA is not set up' });
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token
    });
    
    // Check backup codes
    const isBackupCode = user.twoFactorAuth.backupCodes && 
                         user.twoFactorAuth.backupCodes.includes(token);
    
    if (verified || isBackupCode) {
      // If this is the first verification, enable 2FA
      if (!user.twoFactorAuth.enabled) {
        user.twoFactorAuth.enabled = true;
        await user.save();
      }
      
      // If using backup code, remove it
      if (isBackupCode) {
        user.twoFactorAuth.backupCodes = user.twoFactorAuth.backupCodes.filter(code => code !== token);
        await user.save();
      }
      
      // Create new token with 2FA verified
      const payload = {
        user: {
          id: user.id,
          role: user.role,
          twoFactorVerified: true
        }
      };
      
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } else {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch (err) {
    console.error('Verify 2FA error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Social media authentication
 * @route   POST /api/auth/social
 * @access  Public
 */
exports.socialAuth = async (req, res) => {
  const { provider, token, email, name } = req.body;
  
  if (!provider || !token || !email) {
    return res.status(400).json({ message: 'Provider, token and email are required' });
  }
  
  try {
    // Verify token with provider (implementation depends on provider)
    // This is a simplified version
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      const username = name ? name.replace(/\s+/g, '') + Math.floor(Math.random() * 1000) : 
                      email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = new User({
        username,
        email,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random`
      });
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      
      await user.save();
      
      // Create default machine for user
      const Machine = require('../models/Machine');
      const defaultMachine = new Machine({
        name: 'Basic Slot Machine',
        description: 'Your first slot machine',
        owner: user._id,
        type: 'basic'
      });
      await defaultMachine.save();
      
      // Add machine to user
      user.machines.push(defaultMachine._id);
      await user.save();
    }
    
    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        
        // Update last login
        user.lastLogin = Date.now();
        user.save();
        
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Social auth error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Refresh JWT token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Check if user exists
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    // Create new token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        twoFactorVerified: decoded.user.twoFactorVerified
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, newToken) => {
        if (err) throw err;
        res.json({ token: newToken });
      }
    );
  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * @desc    Send password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set token expiration (1 hour)
    const resetTokenExpires = Date.now() + 3600000;
    
    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();
    
    // In a real application, send email with reset link
    // For this example, just return the token
    res.json({
      message: 'Password reset email sent',
      resetToken // In production, this would be sent via email
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { token, password } = req.body;
  
  try {
    // Find user with token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).send('Server error');
  }
};