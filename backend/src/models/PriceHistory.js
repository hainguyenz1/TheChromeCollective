const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
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
  source: {
    type: String,
    enum: ['retail', 'resale', 'user', 'market'],
    default: 'user'
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient queries
priceHistorySchema.index({ productId: 1, date: -1 });
priceHistorySchema.index({ date: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
