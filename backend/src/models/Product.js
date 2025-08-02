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
    maxlength: 2000
  },
  brand: {
    type: String,
    default: 'Chrome Hearts',
    enum: ['Chrome Hearts']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100
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
  specifications: {
    material: {
      type: String,
      trim: true,
      maxlength: 100
    },
    color: {
      type: String,
      trim: true,
      maxlength: 50
    },
    size: {
      type: String,
      trim: true,
      maxlength: 50
    },
    weight: {
      type: Number,
      min: 0
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    year: {
      type: Number,
      min: 1988, // Chrome Hearts founded in 1988
      max: new Date().getFullYear()
    },
    collection: {
      type: String,
      trim: true,
      maxlength: 100
    },
    styleNumber: {
      type: String,
      trim: true,
      maxlength: 50
    }
  },
  pricing: {
    retailPrice: {
      type: Number,
      min: 0,
      required: true
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY']
    },
    priceHistory: [{
      price: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      source: { type: String, enum: ['retail', 'resale', 'user'] }
    }]
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'excellent', 'good', 'fair', 'poor'],
    default: 'new'
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
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  stats: {
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    listingCount: { type: Number, default: 0 },
    averagePrice: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'specifications.year': -1 });
productSchema.index({ 'pricing.retailPrice': 1 });
productSchema.index({ condition: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'stats.viewCount': -1 });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for current average price
productSchema.virtual('currentAveragePrice').get(function() {
  if (this.pricing.priceHistory.length === 0) return this.pricing.retailPrice;
  
  const recentPrices = this.pricing.priceHistory
    .filter(price => price.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
    .map(price => price.price);
  
  if (recentPrices.length === 0) return this.pricing.retailPrice;
  
  return recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
});

// Method to add price to history
productSchema.methods.addPriceToHistory = function(price, source = 'user') {
  this.pricing.priceHistory.push({
    price,
    date: new Date(),
    source
  });
  
  // Keep only last 50 price entries
  if (this.pricing.priceHistory.length > 50) {
    this.pricing.priceHistory = this.pricing.priceHistory.slice(-50);
  }
  
  return this.save();
};

// Method to increment view count
productSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  return this.save();
};

// Ensure virtuals are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema); 