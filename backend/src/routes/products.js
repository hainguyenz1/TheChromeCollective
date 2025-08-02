const express = require('express');
const router = express.Router();

// Placeholder product routes (will be implemented later)
router.get('/', (req, res) => {
  res.json({ message: 'Get all products - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get product ${req.params.id} - to be implemented` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create product - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update product ${req.params.id} - to be implemented` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete product ${req.params.id} - to be implemented` });
});

module.exports = router; 