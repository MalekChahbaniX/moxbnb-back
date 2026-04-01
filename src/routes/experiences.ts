import { Router } from 'express';
import { experienceController } from '../controllers/experienceController';

const router = Router();

router.get('/', experienceController.getExperiences);
router.get('/:id', experienceController.getExperienceById);

export default router;
