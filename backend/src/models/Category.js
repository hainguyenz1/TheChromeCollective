const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  image: {
    url: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      maxlength: 200
    }
  },
  icon: {
    type: String,
    maxlength: 50
  },
  color: {
    type: String,
    maxlength: 7, // Hex color code
    default: '#000000'
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  stats: {
    productCount: { type: Number, default: 0 },
    listingCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 }
  },
  metadata: {
    seoTitle: {
      type: String,
      maxlength: 200
    },
    seoDescription: {
      type: String,
      maxlength: 500
    },
    keywords: [{
      type: String,
      trim: true,
      maxlength: 50
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ 'stats.productCount': -1 });

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  if (!this.parent) return this.name;
  
  // This would need to be populated to work properly
  return this.parent ? `${this.parent.fullPath} > ${this.name}` : this.name;
});

// Virtual for level (depth in hierarchy)
categorySchema.virtual('level').get(function() {
  if (!this.parent) return 0;
  // This would need to be calculated based on parent chain
  return 1; // Simplified for now
});

// Method to get all children recursively
categorySchema.methods.getAllChildren = async function() {
  const children = await this.model('Category').find({ parent: this._id });
  let allChildren = [...children];
  
  for (const child of children) {
    const grandChildren = await child.getAllChildren();
    allChildren = allChildren.concat(grandChildren);
  }
  
  return allChildren;
};

// Method to get all parents recursively
categorySchema.methods.getAllParents = async function() {
  const parents = [];
  let currentCategory = this;
  
  while (currentCategory.parent) {
    const parent = await this.model('Category').findById(currentCategory.parent);
    if (parent) {
      parents.unshift(parent);
      currentCategory = parent;
    } else {
      break;
    }
  }
  
  return parents;
};

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Ensure virtuals are serialized
categorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema); 