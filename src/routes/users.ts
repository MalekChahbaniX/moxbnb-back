import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { userController } from '../controllers/userController';

const router = Router();

// Admin routes
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), userController.getUsers);
router.get('/:id', userController.getUserById);

// User account routes (require authentication)
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/password', authMiddleware, userController.changePassword);
router.get('/settings', authMiddleware, userController.getSettings);
router.put('/settings', authMiddleware, userController.updateSettings);
router.delete('/account', authMiddleware, userController.deleteAccount);
router.get('/export', authMiddleware, userController.exportData);

export default router;
