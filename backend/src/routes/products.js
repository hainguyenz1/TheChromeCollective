const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, images, retailPrice, currency, category } = req.body;
    
    // Validate required fields
    if (!name || !description || !retailPrice || !category) {
      return res.status(400).json({ 
        error: 'Name, description, retailPrice, and category are required' 
      });
    }

    // Validate images array
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ 
        error: 'At least one image is required' 
      });
    }

    // Validate each image has required fields
    for (const image of images) {
      if (!image.key || !image.url) {
        return res.status(400).json({ 
          error: 'Each image must have key and url' 
        });
      }
    }

    // Create new product
    const product = new Product({
      name,
      description,
      images,
      retailPrice: parseFloat(retailPrice),
      currency: currency || 'USD',
      category
    });

    const savedProduct = await product.save();
    
    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create product' 
    });
  }
});

// Get all products with pagination and sorting
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'createdAt', 
      order = 'desc',
      category,
      search 
    } = req.query;

    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products' 
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product' 
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, images, retailPrice, currency, category } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (images) updateData.images = images;
    if (retailPrice) updateData.retailPrice = parseFloat(retailPrice);
    if (currency) updateData.currency = currency;
    if (category) updateData.category = category;
    
    updateData.updatedAt = new Date();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      error: 'Failed to update product' 
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    res.json({
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product' 
    });
  }
});

module.exports = router; 