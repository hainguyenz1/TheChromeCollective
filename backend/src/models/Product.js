const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: [{
    key: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  retailPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  },
  category: {
    type: String,
    required: true,
    enum: ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Jackets', 'Shirts', 'Pants', 'Shoes', 'Accessories', 'Other']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema); 