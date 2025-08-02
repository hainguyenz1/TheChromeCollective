const express = require('express');
const router = express.Router();

// Placeholder auth routes (will be implemented later)
router.post('/register', (req, res) => {
  res.json({ message: 'Registration endpoint - to be implemented' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - to be implemented' });
});

module.exports = router; 