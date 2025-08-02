const express = require('express');
const router = express.Router();

// Placeholder image routes (will be implemented later)
router.post('/upload', (req, res) => {
  res.json({ message: 'Upload image - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get image ${req.params.id} - to be implemented` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete image ${req.params.id} - to be implemented` });
});

module.exports = router; 