import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://moxbnb.netlify.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  // Test endpoint
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      method: req.method
    });
  }

  // Test POST (like register)
  if (req.method === 'POST') {
    return res.status(201).json({ 
      message: 'Test POST working',
      timestamp: new Date().toISOString(),
      body: req.body
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
