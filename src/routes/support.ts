import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { supportController } from '../controllers/supportController';

const router = Router();

// FAQ endpoints (no authentication required)
router.get('/faqs', supportController.getFaqs);
router.get('/contact', supportController.getContactInfo);

// Ticket endpoints (require authentication)
router.use(authMiddleware);
router.post('/tickets', supportController.createTicket);
router.get('/tickets', supportController.getTickets);
router.get('/tickets/:ticketId', supportController.getTicketById);
router.put('/tickets/:ticketId', supportController.updateTicket);

export default router;
