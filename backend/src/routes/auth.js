const express = require('express');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Health check endpoint for Auth0
router.get('/', (req, res) => {
  res.json({ 
    message: 'TheChromeCollective API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get user profile (requires authentication)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update user profile (requires authentication)
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const { username, profile } = req.body;
    
    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        auth0Id: { $ne: req.user.auth0Id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Username already taken' 
        });
      }
    }

    // Find or create user
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      // Create new user
      user = new User({
        auth0Id: req.user.auth0Id,
        email: req.user.email,
        username: username || req.user.username,
        profile: profile || {}
      });
    } else {
      // Update existing user
      if (username) user.username = username;
      if (profile) {
        user.profile = { ...user.profile, ...profile };
      }
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user stats (requires authentication)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      stats: user.stats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth0 callback endpoint (for webhook integration if needed)
router.post('/callback', (req, res) => {
  // This endpoint can be used for Auth0 webhooks or post-login actions
  res.json({ message: 'Auth0 callback received' });
});

module.exports = router; 