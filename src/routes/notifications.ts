import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { notificationController } from '../controllers/notificationController';
import { validateRequest } from '../middleware/validation';
import { markNotificationsReadSchema, deleteNotificationsSchema } from '../utils/validationSchemas';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/:id', notificationController.getNotificationById);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-multiple-read', validateRequest(markNotificationsReadSchema), notificationController.markMultipleAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/delete-multiple', validateRequest(deleteNotificationsSchema), notificationController.deleteMultipleNotifications);

export default router;
