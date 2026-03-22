import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createBookingSchema } from '../utils/validationSchemas';

const router = Router();

// All booking routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', bookingController.getBookings);
router.post('/', validateRequest(createBookingSchema), bookingController.createBooking);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;
