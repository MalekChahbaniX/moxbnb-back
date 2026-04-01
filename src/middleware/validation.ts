import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AuthenticatedRequest } from './auth';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const { error } = schema.validate((req as any).body);

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessage
      });
      return;
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorMessage
      });
      return;
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        error: 'Parameter validation failed',
        details: errorMessage
      });
      return;
    }

    next();
  };
};

// Validation schemas for different entities
export const commonSchemas = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', 'price', 'rating', 'title').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100),
    category: Joi.string(),
    type: Joi.string(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    rating: Joi.number().min(1).max(5),
    city: Joi.string(),
    country: Joi.string()
  }),

  fileUpload: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/webp').required(),
    size: Joi.number().max(5 * 1024 * 1024).required() // 5MB max
  })
};

// Validation for authenticated requests
export const validateAuthenticatedRequest = (schema: Joi.ObjectSchema) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { error } = schema.validate((req as any).body);

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessage
      });
      return;
    }

    next();
  };
};
