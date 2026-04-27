import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import * as adminController from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminAuth);

// Listings management
router.get('/listings', adminController.getAllListings);
router.get('/listings/pending', adminController.getPendingListings);
router.put('/listings/:id/approve', adminController.approveListing);
router.put('/listings/:id/reject', adminController.rejectListing);
router.get('/listings/:id', adminController.getListingDetails);

// Services management
router.get('/services', adminController.getAllServices);
router.get('/services/pending', adminController.getPendingServices);
router.put('/services/:id/approve', adminController.approveService);
router.put('/services/:id/reject', adminController.rejectService);
router.get('/services/:id', adminController.getServiceDetails);

// Experiences management
router.get('/experiences', adminController.getAllExperiences);
router.get('/experiences/pending', adminController.getPendingExperiences);
router.put('/experiences/:id/approve', adminController.approveExperience);
router.put('/experiences/:id/reject', adminController.rejectExperience);
router.get('/experiences/:id', adminController.getExperienceDetails);

// Users management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);
router.put('/users/:id/role', adminController.updateUserRole);

// Reviews moderation
router.get('/reviews/flagged', adminController.getFlaggedReviews);
router.put('/reviews/:id/approve', adminController.approveReview);
router.put('/reviews/:id/reject', adminController.rejectReview);

// Platform statistics
router.get('/statistics/overview', adminController.getPlatformOverview);
router.get('/statistics/revenue', adminController.getRevenueStats);
router.get('/statistics/users', adminController.getUserStats);
router.get('/statistics/bookings', adminController.getBookingStats);

// Dashboard data
router.get('/dashboard', adminController.getAdminDashboard);

export default router;
