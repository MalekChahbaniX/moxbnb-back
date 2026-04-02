import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/auth';
import { paymentController } from '../controllers/paymentController';
import { validateRequest } from '../middleware/validation';
import { createPaymentIntentSchema, confirmPaymentSchema, refundPaymentSchema } from '../utils/validationSchemas';

const router = Router();

// All payment routes require authentication
router.use(authMiddleware);

// Routes
router.post('/create-intent', validateRequest(createPaymentIntentSchema), paymentController.createPaymentIntent);
router.post('/confirm', validateRequest(confirmPaymentSchema), paymentController.confirmPayment);
router.get('/history', paymentController.getPaymentHistory);
router.get('/booking/:bookingId', paymentController.getPaymentDetails);

// Admin only routes
router.post('/refund', roleMiddleware(['ADMIN']), validateRequest(refundPaymentSchema), paymentController.processRefund);

// Webhook endpoint (no auth required)
router.post('/webhook', paymentController.handleWebhook);

export default router;
