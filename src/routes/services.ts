import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createServiceSchema } from '../utils/validationSchemas';

const router = Router();

// Public routes
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

// Protected routes (providers only)
router.get('/my', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), serviceController.getMyServices);
router.post('/', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), validateRequest(createServiceSchema), serviceController.createService);
router.put('/:id', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), validateRequest(createServiceSchema), serviceController.updateService);
router.delete('/:id', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), serviceController.deleteService);

export default router;
