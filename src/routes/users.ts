import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { userController } from '../controllers/userController';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(['ADMIN']), userController.getUsers);
router.get('/:id', userController.getUserById);

export default router;
