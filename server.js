/**
 * Goal Update Analyzer - Express Server
 * 
 * Simple local server that serves the web app and provides
 * a POST /analyze endpoint for text analysis.
 */

const express = require('express');
const path = require('path');
const analyzer = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route serves the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * POST /analyze
 * Analyzes goal update text and returns summary, sentiment, and next step.
 * 
 * Request body: { text: string }
 * Response: { summaryBullets: string[], sentimentLabel: string, nextStep: string }
 */
app.post('/analyze', (req, res) => {
  try {
    const { text } = req.body;
    
    // Validation: check if text is provided
    if (!text) {
      return res.status(400).json({
        error: 'Text is required',
        message: 'Please provide text in the request body'
      });
    }
    
    // Validation: check if text is a string
    if (typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text must be a string'
      });
    }
    
    // Validation: check if text is not empty after trimming
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return res.status(400).json({
        error: 'Empty text',
        message: 'Text cannot be empty'
      });
    }
    
    // Validation: check max length (5000 characters)
    const MAX_LENGTH = 5000;
    if (trimmedText.length > MAX_LENGTH) {
      return res.status(400).json({
        error: 'Text too long',
        message: `Text must be ${MAX_LENGTH} characters or less (received ${trimmedText.length})`
      });
    }
    
    // Perform analysis
    const analysis = analyzer.analyzeText(trimmedText);
    
    // Return analysis results
    res.json(analysis);
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error analyzing text:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while analyzing the text'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Goal Update Analyzer running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server`);
});

