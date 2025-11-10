import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Chat with data endpoint
router.post('/chat-with-data', async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get Vanna AI server URL from environment
    const vannaApiUrl = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';

    // Forward the request to Vanna AI server
    const vannaResponse = await axios.post(`${vannaApiUrl}/chat`, {
      question: query,
      context: context || {}
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.VANNA_API_KEY && { 
          'Authorization': `Bearer ${process.env.VANNA_API_KEY}` 
        })
      }
    });

    res.json(vannaResponse.data);
  } catch (error: any) {
    console.error('Error in chat-with-data:', error.message);
    
    if (error.response) {
      // Vanna AI server error
      res.status(error.response.status).json({
        error: 'AI service error',
        details: error.response.data?.error || 'Unknown error'
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      // Connection error
      res.status(503).json({
        error: 'AI service unavailable',
        message: 'The AI service is currently unavailable. Please try again later.'
      });
    } else {
      // Other errors
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process chat request'
      });
    }
  }
});

// Get chat history (optional feature)
router.get('/history', async (req: Request, res: Response) => {
  try {
    // This would typically fetch from a database where chat history is stored
    // For now, return empty array
    res.json({
      conversations: [],
      message: 'Chat history feature not yet implemented'
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;
