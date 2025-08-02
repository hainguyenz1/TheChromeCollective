const express = require('express');
const router = express.Router();

// Placeholder category routes (will be implemented later)
router.get('/', (req, res) => {
  res.json({ message: 'Get all categories - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get category ${req.params.id} - to be implemented` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create category - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update category ${req.params.id} - to be implemented` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete category ${req.params.id} - to be implemented` });
});

module.exports = router; 