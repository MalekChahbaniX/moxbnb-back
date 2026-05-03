import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createServiceSchema } from '../utils/validationSchemas';

const router = Router();

// Public routes
router.get('/', serviceController.getServices);

// Protected routes (providers only) - MUST come before /:id
router.get('/my', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), serviceController.getMyServices);
router.post('/', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), validateRequest(createServiceSchema), serviceController.createService);

// Public routes with ID - MUST come after /my
router.get('/:id', serviceController.getServiceById);
router.put('/:id', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), validateRequest(createServiceSchema), serviceController.updateService);
router.delete('/:id', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), serviceController.deleteService);

export default router;
