const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  price: {
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
    trim: true,
    maxlength: 100
  },
  condition: {
    type: String,
    default: 'Used',
    enum: ['New', 'Used', 'Refurbished']
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
  ownerId: {
    type: String,
    required: false,
    default: 'anonymous'
  }
}, {
  timestamps: true
});

// Index for efficient queries
listingSchema.index({ category: 1, createdAt: -1 });
listingSchema.index({ condition: 1, createdAt: -1 });
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema); 