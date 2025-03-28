const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies the JWT token in the request header and attaches the user to the request object
 */
module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded.user;
    
    // Check if user exists in database
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }
    
    // Check if user has 2FA enabled and verified
    if (user.twoFactorAuth && user.twoFactorAuth.enabled) {
      // If 2FA is enabled but not verified for this session
      if (!req.user.twoFactorVerified) {
        return res.status(401).json({ 
          message: 'Two-factor authentication required',
          requiresTwoFactor: true
        });
      }
    }
    
    // Add full user object to request
    req.fullUser = user;
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};