const express = require('express');
const router = express.Router();

// Placeholder listing routes (will be implemented later)
router.get('/', (req, res) => {
  res.json({ message: 'Get all listings - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get listing ${req.params.id} - to be implemented` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create listing - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update listing ${req.params.id} - to be implemented` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete listing ${req.params.id} - to be implemented` });
});

module.exports = router; 