import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';
import { connectDB } from '../src/config/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set timeout for serverless function (Vercel max is 10 seconds)
  res.setTimeout(9000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });

  try {
    // Ensure database is connected before handling requests
    await connectDB();
    
    // Forward the request to the Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
