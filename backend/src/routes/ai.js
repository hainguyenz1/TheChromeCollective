const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth');

// Rate limiting middleware for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many AI requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all AI routes
router.use(aiRateLimit);

// Build prompt from form fields
const buildPromptFromFields = (fields) => {
  const { title, category, condition, price, currency, notes } = fields;
  
  return `System: You are a concise marketplace copywriter.
Style: Neutral, factual, 3–4 sentences, no emojis, no sales hype.
Include: item name, material if known then mention it or else not writing anything about it, size if given then mentioned or else not writing anything about it, condition, any notable details, mention about the price.
Avoid: Here is the generated description, authenticity claims, shipping/payment text, contact info, HTML.
Output: plain text only.

Item:
- Title: ${title || 'N/A'}
- Category: ${category || 'N/A'}
- Condition: ${condition || 'N/A'}
- Price: ${price ? `${price} ${currency || 'USD'}` : 'N/A'}
- Notes: ${notes || 'N/A'}

Generate a concise, neutral product description:`;
};

// Sanitize AI response
const sanitizeResponse = (text, maxTokens = 160) => {
  if (!text) return '';
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Collapse whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Trim to approximate character limit (roughly 4 chars per token)
  const charLimit = maxTokens * 4;
  if (sanitized.length > charLimit) {
    sanitized = sanitized.substring(0, charLimit).trim();
    // Try to end at a sentence
    const lastPeriod = sanitized.lastIndexOf('.');
    if (lastPeriod > charLimit * 0.8) {
      sanitized = sanitized.substring(0, lastPeriod + 1);
    }
  }
  
  return sanitized.trim();
};

// AI Description Generation Endpoint
router.post('/describe', async (req, res) => {
  try {
    const { title, category, condition, price, currency, notes } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ 
        error: 'Title is required for AI description generation' 
      });
    }

    // Build the prompt
    const prompt = buildPromptFromFields({ title, category, condition, price, currency, notes });
    
    // Prepare Ollama request payload
    const payload = {
      model: process.env.OLLAMA_MODEL || 'llama3',
      stream: false,
      options: { 
        temperature: 0.6,
        num_predict: parseInt(process.env.AI_DESCRIPTION_MAXTOKENS) || 160
      },
      prompt: prompt
    };

    // Set up timeout
    const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS) || 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Make request to Ollama
      const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
      const response = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('No response from Ollama');
      }

      // Sanitize and return the description
      const description = sanitizeResponse(data.response, process.env.AI_DESCRIPTION_MAXTOKENS);
      
      console.log('AI Description generated successfully:', {
        title,
        category,
        responseLength: data.response.length,
        sanitizedLength: description.length
      });

      res.json({ description });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('AI request timed out after', timeoutMs, 'ms');
        return res.status(503).json({ 
          error: 'AI request timed out. Please try again.' 
        });
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('AI Description generation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    // Check if it's a connection error to Ollama
    if (error.code === 'ECONNREFUSED' || 
        error.message.includes('fetch') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('Failed to fetch')) {
      return res.status(503).json({ 
        error: 'AI is unavailable right now. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate AI description. Please try again.' 
    });
  }
});

module.exports = router;
