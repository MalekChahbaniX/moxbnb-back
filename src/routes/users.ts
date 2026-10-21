import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { userController } from '../controllers/userController';

const router = Router();

// Admin routes
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), userController.getUsers);

// User account routes (require authentication)
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/password', authMiddleware, userController.changePassword);
router.get('/settings', authMiddleware, userController.getSettings);
router.put('/settings', authMiddleware, userController.updateSettings);
router.delete('/account', authMiddleware, userController.deleteAccount);
router.get('/export', authMiddleware, userController.exportData);

// Restrict IDs to MongoDB ObjectId format so static paths can never match this route.
router.get('/:id([0-9a-fA-F]{24})', userController.getUserById);

export default router;
