import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { Listing } from '../models/Listing';
import { Experience } from '../models/Experience';
import { Service } from '../models/Service';
import { Booking } from '../models/Booking';

export const reviewController = {
  // Get all reviews (optionally filtered by listing/experience/service)
  getReviews: async (req: Request, res: Response) => {
    try {
      const { listingId, experienceId, serviceId } = req.query;
      
      const filter: any = {};
      if (listingId) filter.listingId = listingId;
      if (experienceId) filter.experienceId = experienceId;
      if (serviceId) filter.serviceId = serviceId;

      const reviews = await Review.find(filter)
        .populate('userId', 'firstName lastName avatar')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch reviews',
      });
    }
  },

  // Get a single review by ID
  getReviewById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const review = await Review.findById(id)
        .populate('userId', 'firstName lastName avatar')
        .populate('listingId')
        .populate('experienceId')
        .populate('serviceId')
        .populate('bookingId');

      if (!review) {
        return res.status(404).json({
          success: false,
          error: 'Review not found',
        });
      }

      res.json({
        success: true,
        data: review,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch review',
      });
    }
  },

  // Create a new review
  createReview: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { rating, comment, listingId, experienceId, serviceId, bookingId } = req.body;

      // Validate required fields
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5',
        });
      }

      if (!listingId && !experienceId && !serviceId) {
        return res.status(400).json({
          success: false,
          error: 'Must specify either listingId, experienceId, or serviceId',
        });
      }

      // Verify booking exists and belongs to user
      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.userId.toString() !== userId) {
          return res.status(403).json({
            success: false,
            error: 'Invalid booking or unauthorized',
          });
        }
      }

      // Check if user already reviewed this booking
      const existingReview = await Review.findOne({ userId, bookingId });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this booking',
        });
      }

      const review = new Review({
        rating,
        comment,
        userId,
        listingId,
        experienceId,
        serviceId,
        bookingId,
      });

      await review.save();

      const populatedReview = await Review.findById(review._id)
        .populate('userId', 'firstName lastName avatar');

      res.status(201).json({
        success: true,
        data: populatedReview,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this booking',
        });
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create review',
      });
    }
  },

  // Update a review
  updateReview: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { rating, comment } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          error: 'Review not found',
        });
      }

      // Check if user owns this review
      if (review.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to update this review',
        });
      }

      // Update fields
      if (rating && rating >= 1 && rating <= 5) {
        review.rating = rating;
      }
      if (comment !== undefined) {
        review.comment = comment;
      }

      await review.save();

      const updatedReview = await Review.findById(review._id)
        .populate('userId', 'firstName lastName avatar');

      res.json({
        success: true,
        data: updatedReview,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update review',
      });
    }
  },

  // Delete a review
  deleteReview: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          error: 'Review not found',
        });
      }

      // Check if user owns this review or is admin
      const user = await User.findById(userId);
      const isOwner = review.userId.toString() === userId;
      const isAdmin = user?.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to delete this review',
        });
      }

      await Review.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete review',
      });
    }
  },

  // Get reviews by user
  getUserReviews: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      const reviews = await Review.find({ userId })
        .populate('listingId')
        .populate('experienceId')
        .populate('serviceId')
        .populate('bookingId')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch user reviews',
      });
    }
  },
};
