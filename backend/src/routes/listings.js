const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// Create a new listing
router.post('/', async (req, res) => {
  console.log('POST /listings request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { title, description, price, currency, category, images } = req.body;
    
    console.log('Extracted data:', { title, description, price, currency, category, imagesCount: images?.length });
    
    // Validate required fields
    if (!title || !description || !price) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ 
        error: 'Title, description, and price are required' 
      });
    }

    // Validate price is a valid number
    if (price === null || price === undefined || price === '') {
      console.log('Validation failed: price is missing or null');
      return res.status(400).json({ 
        error: 'Price is required and must be a valid number' 
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      console.log('Validation failed: price is not a valid positive number:', price);
      return res.status(400).json({ 
        error: 'Price must be a valid positive number' 
      });
    }

    // Validate images array (optional but if provided, must be valid)
    if (images && Array.isArray(images)) {
      for (const image of images) {
        if (!image.key || !image.url) {
          console.log('Validation failed: image missing key or url:', image);
          return res.status(400).json({ 
            error: 'Each image must have key and url' 
          });
        }
      }
    }

    console.log('Validation passed, creating listing...');

    // Create new listing
    const listing = new Listing({
      title,
      description,
      price: parsedPrice,
      currency: currency || 'USD',
      category,
      images: images || [],
      ownerId: null // Optional for now
    });

    console.log('Listing model created:', JSON.stringify(listing, null, 2));

    const savedListing = await listing.save();
    
    console.log('Listing saved successfully:', JSON.stringify(savedListing, null, 2));
    
    res.status(201).json({
      message: 'Listing created successfully',
      listing: savedListing
    });

  } catch (error) {
    console.error('Error creating listing:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create listing',
      details: error.message
    });
  }
});

// Get all listings with pagination and sorting
router.get('/', async (req, res) => {
  // Disable caching for this endpoint
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  console.log('GET /listings request received');
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
    const listings = await Listing.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`Found ${listings.length} listings`);

    // Get total count for pagination
    const total = await Listing.countDocuments(query);
    
    console.log(`Total listings in database: ${total}`);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      listings,
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
    console.error('Error fetching listings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch listings',
      details: error.message
    });
  }
});

// Get listing by ID
router.get('/:id', async (req, res) => {
  // Disable caching for this endpoint
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ 
        error: 'Listing not found' 
      });
    }
    
    res.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ 
      error: 'Failed to fetch listing' 
    });
  }
});

// Update listing
router.put('/:id', async (req, res) => {
  try {
    const { title, description, price, currency, category, images } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (images) updateData.images = images;
    if (price) updateData.price = parseFloat(price);
    if (currency) updateData.currency = currency;
    if (category) updateData.category = category;
    
    updateData.updatedAt = new Date();

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!listing) {
      return res.status(404).json({ 
        error: 'Listing not found' 
      });
    }
    
    res.json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ 
      error: 'Failed to update listing' 
    });
  }
});

// Delete listing
router.delete('/:id', async (req, res) => {
  try {
    console.log('DELETE /listings request received for ID:', req.params.id);
    
    const listing = await Listing.findByIdAndDelete(req.params.id);
    
    if (!listing) {
      console.log('Listing not found for deletion');
      return res.status(404).json({ 
        error: 'Listing not found' 
      });
    }
    
    console.log('Listing deleted successfully:', listing.title);
    
    res.json({
      message: 'Listing deleted successfully',
      listing
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ 
      error: 'Failed to delete listing',
      details: error.message
    });
  }
});

module.exports = router; 