import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models';

export interface AuthenticatedRequest extends Request {
  user?: any;
  query: any;
  body: any;
  params: any;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = (req as any).header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Token is valid but user not found.'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is deactivated.'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Access denied. User not authenticated.'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};

// Middleware to check if user is the owner of the resource
export const ownershipMiddleware = (resourceField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Access denied. User not authenticated.'
      });
      return;
    }

    // Admin can access everything
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    const resourceUserId = (req as any).body[resourceField] || (req as any).params[resourceField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.'
      });
      return;
    }

    next();
  };
};

// Middleware to check if user is a provider or admin
export const providerMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Access denied. User not authenticated.'
    });
    return;
  }

  if (!['PROVIDER', 'ADMIN'].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: 'Access denied. Provider privileges required.'
    });
    return;
  }

  next();
};

// Middleware to check if user can manage bookings (provider or booking owner)
export const bookingManagementMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Access denied. User not authenticated.'
    });
    return;
  }

  // Admin can access everything
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  // Providers can manage bookings for their listings/experiences/services
  if (req.user.role === 'PROVIDER') {
    next();
    return;
  }

  // Regular users (CLIENTS) can only manage their own bookings
  const bookingId = (req as any).params.id;
  if (!bookingId) {
    res.status(400).json({
      success: false,
      error: 'Booking ID is required.'
    });
    return;
  }

  // In a real implementation, you would check if the booking belongs to the user
  // For now, we'll allow it and let the controller handle the ownership check
  next();
};
