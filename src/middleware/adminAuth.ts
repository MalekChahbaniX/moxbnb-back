import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const adminAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (String(req.user.role).toUpperCase() !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Admin access required. Insufficient permissions.'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};
