const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Create a new product
router.post('/', async (req, res) => {
  console.log('POST /products request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { name, description, images, retailPrice, currency, category } = req.body;
    
    console.log('Raw request body:', req.body);
    console.log('Extracted data:', { name, description, retailPrice, currency, category, imagesCount: images?.length });
    console.log('retailPrice type:', typeof retailPrice, 'value:', retailPrice);
    
    // Validate required fields
    if (!name || !description || !category) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ 
        error: 'Name, description, and category are required' 
      });
    }

    // Validate retailPrice specifically
    if (retailPrice === null || retailPrice === undefined || retailPrice === '') {
      console.log('Validation failed: retailPrice is missing or null');
      return res.status(400).json({ 
        error: 'Retail price is required and must be a valid number' 
      });
    }

    const parsedPrice = parseFloat(retailPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      console.log('Validation failed: retailPrice is not a valid positive number:', retailPrice);
      return res.status(400).json({ 
        error: 'Retail price must be a valid positive number' 
      });
    }

    // Validate images array
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.log('Validation failed: images array is invalid');
      return res.status(400).json({ 
        error: 'At least one image is required' 
      });
    }

    // Validate each image has required fields
    for (const image of images) {
      if (!image.key || !image.url) {
        console.log('Validation failed: image missing key or url:', image);
        return res.status(400).json({ 
          error: 'Each image must have key and url' 
        });
      }
    }

    console.log('Validation passed, creating product...');

    // Create new product
    const product = new Product({
      name,
      description,
      images,
      retailPrice: parsedPrice,
      currency: currency || 'USD',
      category
    });

    console.log('Product model created:', JSON.stringify(product, null, 2));

    const savedProduct = await product.save();
    
    console.log('Product saved successfully:', JSON.stringify(savedProduct, null, 2));
    
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
      error: 'Failed to create product',
      details: error.message
    });
  }
});

// Get all products with pagination and sorting
router.get('/', async (req, res) => {
  // Disable caching for this endpoint
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  console.log('GET /products request received');
  console.log('Query parameters:', req.query);

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

    console.log('MongoDB query:', JSON.stringify(query));

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('Executing MongoDB query...');
    
    // Execute query
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`Found ${products.length} products`);

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    console.log(`Total products in database: ${total}`);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  // Disable caching for this endpoint
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

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
    console.log('DELETE /products request received for ID:', req.params.id);
    
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      console.log('Product not found for deletion');
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    console.log('Product deleted successfully:', product.name);
    
    res.json({
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message
    });
  }
});

module.exports = router; 