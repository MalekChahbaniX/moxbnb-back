import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  role: Joi.string().valid('GUEST', 'CLIENT', 'HOST', 'PROVIDER', 'ADMIN').default('CLIENT'),
  language: Joi.string().valid('fr', 'ar', 'en').default('fr'),
  currency: Joi.string().valid('TND', 'EUR', 'USD').default('TND'),
  // Provider specific fields
  serviceTypes: Joi.array().items(Joi.string()).optional(),
  companyName: Joi.string().max(200).optional(),
  specialization: Joi.string().max(200).optional(),
  experience: Joi.string().max(2000).optional(),
  // Host specific fields
  propertyTypes: Joi.array().items(Joi.string()).optional(),
  address: Joi.string().max(500).optional(),
  city: Joi.string().max(100).optional(),
  description: Joi.string().max(2000).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  avatar: Joi.string().uri().optional(),
  language: Joi.string().valid('fr', 'ar', 'en').optional(),
  currency: Joi.string().valid('TND', 'EUR', 'USD').optional(),
  timezone: Joi.string().optional()
});

// Listing validation schemas
export const createListingSchema = Joi.object({
  title: Joi.string().min(10).max(200).required().messages({
    'string.min': 'Title must be at least 10 characters long',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(50).max(2000).required().messages({
    'string.min': 'Description must be at least 50 characters long',
    'string.max': 'Description cannot exceed 2000 characters',
    'any.required': 'Description is required'
  }),
  type: Joi.string().valid('APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'CABIN', 'LOFT', 'CONDO', 'TOWNHOUSE').required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  currency: Joi.string().valid('TND', 'EUR', 'USD').default('TND'),
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().default('Tunisia'),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).required().messages({
    'array.min': 'At least one image is required'
  }),
  amenities: Joi.array().items(Joi.string()).default([]),
  bedrooms: Joi.number().integer().min(0).max(20).optional(),
  bathrooms: Joi.number().integer().min(0).max(20).optional(),
  maxGuests: Joi.number().integer().min(1).max(50).required(),
  size: Joi.number().min(0).optional(),
  rules: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'RENTED', 'SUSPENDED', 'ARCHIVED').default('DRAFT')
});

export const updateListingSchema = Joi.object({
  title: Joi.string().min(10).max(200).optional(),
  description: Joi.string().min(50).max(2000).optional(),
  type: Joi.string().valid('APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'CABIN', 'LOFT', 'CONDO', 'TOWNHOUSE').optional(),
  category: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  currency: Joi.string().valid('TND', 'EUR', 'USD').optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  bedrooms: Joi.number().integer().min(0).max(20).optional(),
  bathrooms: Joi.number().integer().min(0).max(20).optional(),
  maxGuests: Joi.number().integer().min(1).max(50).optional(),
  size: Joi.number().min(0).optional(),
  rules: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'RENTED', 'SUSPENDED', 'ARCHIVED').optional()
});

// Booking validation schemas
export const createBookingSchema = Joi.object({
  type: Joi.string().valid('PROPERTY', 'EXPERIENCE', 'SERVICE').required(),
  itemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  checkIn: Joi.date().iso().required().messages({
    'date.format': 'Check-in date must be in ISO format',
    'any.required': 'Check-in date is required'
  }),
  checkOut: Joi.date().iso().when('type', {
    is: 'SERVICE',
    then: Joi.optional(),
    otherwise: Joi.required().messages({
      'any.required': 'Check-out date is required for properties and experiences'
    })
  }),
  guests: Joi.number().integer().min(1).max(50).required(),
  specialRequests: Joi.string().max(1000).optional()
});

// Review validation schemas
export const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required'
  }),
  comment: Joi.string().max(1000).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  listingId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  experienceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  serviceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  bookingId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().max(1000).optional(),
  images: Joi.array().items(Joi.string().uri()).optional()
});

// Message validation schemas
export const createMessageSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Message content cannot be empty',
    'string.max': 'Message cannot exceed 1000 characters',
    'any.required': 'Message content is required'
  }),
  type: Joi.string().valid('TEXT', 'IMAGE', 'FILE', 'LOCATION').default('TEXT'),
  receiverId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  bookingId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
});

// Experience validation schemas
export const createExperienceSchema = Joi.object({
  title: Joi.string().min(10).max(200).required(),
  description: Joi.string().min(50).max(2000).required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  currency: Joi.string().valid('TND', 'EUR', 'USD').default('TND'),
  duration: Joi.number().integer().min(15).max(480).required(),
  maxGuests: Joi.number().integer().min(1).max(100).required(),
  location: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().default('Tunisia'),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  includes: Joi.array().items(Joi.string()).default([]),
  requirements: Joi.array().items(Joi.string()).default([]),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').default('BEGINNER')
});

// Service validation schemas
export const createServiceSchema = Joi.object({
  title: Joi.string().min(10).max(200).required(),
  description: Joi.string().min(50).max(2000).required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  currency: Joi.string().valid('TND', 'EUR', 'USD').default('TND'),
  duration: Joi.number().integer().min(30).max(480).required(),
  location: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  country: Joi.string().default('Tunisia'),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).required()
});

// Payment validation schemas
export const createPaymentIntentSchema = Joi.object({
  bookingId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid booking ID format',
    'any.required': 'Booking ID is required'
  }),
  amount: Joi.number().min(0.01).required().messages({
    'number.min': 'Amount must be greater than 0',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().valid('usd', 'eur', 'tnd').default('usd')
});

export const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required().messages({
    'any.required': 'Payment intent ID is required'
  })
});

export const refundPaymentSchema = Joi.object({
  bookingId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid booking ID format',
    'any.required': 'Booking ID is required'
  }),
  reason: Joi.string().max(500).optional()
});

// Notification validation schemas
export const markNotificationsReadSchema = Joi.object({
  notificationIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional()
});

export const deleteNotificationsSchema = Joi.object({
  notificationIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional()
});

// Upload validation schemas
export const deleteFileSchema = Joi.object({
  filename: Joi.string().required().messages({
    'any.required': 'Filename is required'
  })
});
