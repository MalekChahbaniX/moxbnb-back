import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { providerController } from '../controllers/providerController';

const router = Router();

// All provider routes require authentication and provider role
router.use(authMiddleware);
router.use(roleMiddleware(['PROVIDER', 'ADMIN']));

// Dashboard and analytics
router.get('/dashboard', providerController.getProviderDashboard);
router.get('/earnings', providerController.getProviderEarnings);

// Booking management
router.get('/bookings', providerController.getProviderBookings);
router.put('/bookings/:id/status', providerController.updateBookingStatus);

// Service management
router.get('/services', providerController.getProviderServices);

// Reviews
router.get('/reviews', providerController.getProviderReviews);

export default router;
