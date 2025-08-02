const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
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
    enum: ['USD', 'EUR', 'GBP', 'JPY']
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'excellent', 'good', 'fair', 'poor'],
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      maxlength: 200
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  location: {
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    state: {
      type: String,
      trim: true,
      maxlength: 100
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: 20
    }
  },
  shipping: {
    isFree: {
      type: Boolean,
      default: false
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    methods: [{
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup']
    }],
    estimatedDays: {
      min: { type: Number, min: 1 },
      max: { type: Number, min: 1 }
    }
  },
  authenticity: {
    isAuthentic: {
      type: Boolean,
      default: true
    },
    verificationMethod: {
      type: String,
      enum: ['verified', 'pending', 'unverified'],
      default: 'pending'
    },
    verificationNotes: {
      type: String,
      maxlength: 500
    },
    hasReceipt: {
      type: Boolean,
      default: false
    },
    hasBox: {
      type: Boolean,
      default: false
    },
    hasDustBag: {
      type: Boolean,
      default: false
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  status: {
    type: String,
    enum: ['active', 'sold', 'expired', 'paused', 'deleted'],
    default: 'active'
  },
  stats: {
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 }
  },
  offers: [{
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    message: {
      type: String,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isNegotiable: {
    type: Boolean,
    default: true
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
listingSchema.index({ product: 1 });
listingSchema.index({ seller: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ condition: 1 });
listingSchema.index({ 'location.country': 1 });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ expiresAt: 1 });
listingSchema.index({ isUrgent: 1 });
listingSchema.index({ 'stats.viewCount': -1 });

// Text index for search
listingSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for primary image
listingSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for time remaining
listingSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active') return null;
  const now = new Date();
  const remaining = this.expiresAt - now;
  return remaining > 0 ? remaining : 0;
});

// Virtual for isExpired
listingSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Method to increment view count
listingSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  return this.save();
};

// Method to add offer
listingSchema.methods.addOffer = function(buyerId, amount, message = '') {
  this.offers.push({
    buyer: buyerId,
    amount,
    message,
    status: 'pending'
  });
  return this.save();
};

// Method to accept offer
listingSchema.methods.acceptOffer = function(offerId) {
  const offer = this.offers.id(offerId);
  if (offer) {
    offer.status = 'accepted';
    this.status = 'sold';
    return this.save();
  }
  throw new Error('Offer not found');
};

// Method to reject offer
listingSchema.methods.rejectOffer = function(offerId) {
  const offer = this.offers.id(offerId);
  if (offer) {
    offer.status = 'rejected';
    return this.save();
  }
  throw new Error('Offer not found');
};

// Pre-save middleware to handle expiration
listingSchema.pre('save', function(next) {
  if (this.isExpired && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Ensure virtuals are serialized
listingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Listing', listingSchema); 