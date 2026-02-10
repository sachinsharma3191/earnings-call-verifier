// Middleware to reduce boilerplate in API endpoints
import type { VercelRequest, VercelResponse } from '@vercel/node';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface HandlerOptions {
  allowedMethods?: HttpMethod[];
  requireBody?: boolean;
}

type HandlerFunction = (req: VercelRequest, res: VercelResponse) => Promise<any>;

export function createApiHandler(
  handler: HandlerFunction,
  options: HandlerOptions = {}
) {
  const { allowedMethods = ['GET'], requireBody = false } = options;

  return async (req: VercelRequest, res: VercelResponse) => {
    // Method validation
    if (!allowedMethods.includes(req.method as HttpMethod)) {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Body validation for POST/PUT/PATCH
    if (requireBody && !req.body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    try {
      const result = await handler(req, res);
      
      // If handler already sent response, don't send again
      if (res.writableEnded) {
        return;
      }

      // Auto-send result if handler returned data
      if (result !== undefined) {
        return res.status(200).json(result);
      }
    } catch (error: any) {
      console.error('API Handler Error:', error);

      // Determine appropriate status code from error message
      let statusCode = 500;
      if (error.message.includes('Missing') || error.message.includes('required')) {
        statusCode = 400;
      } else if (error.message.includes('not found')) {
        statusCode = 404;
      } else if (error.message.includes('Unauthorized') || error.message.includes('forbidden')) {
        statusCode = 403;
      }

      return res.status(statusCode).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  };
}
