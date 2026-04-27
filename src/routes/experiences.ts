import { Router } from 'express';
import { experienceController } from '../controllers/experienceController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createExperienceSchema } from '../utils/validationSchemas';

const router = Router();

// Public routes
router.get('/', experienceController.getExperiences);
router.get('/:id', experienceController.getExperienceById);

// Protected routes (providers only)
router.get('/my', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), experienceController.getMyExperiences);
router.post('/', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), validateRequest(createExperienceSchema), experienceController.createExperience);
router.put('/:id', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), validateRequest(createExperienceSchema), experienceController.updateExperience);
router.delete('/:id', authMiddleware, roleMiddleware(['PROVIDER', 'ADMIN']), experienceController.deleteExperience);

export default router;
