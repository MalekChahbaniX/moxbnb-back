import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { reviewController } from '../controllers/reviewController';
import { validateRequest } from '../middleware/validation';
import { createReviewSchema, updateReviewSchema } from '../utils/validationSchemas';

const router = Router();

// Public routes
router.get('/', reviewController.getReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes
router.use(authMiddleware);
router.post('/', validateRequest(createReviewSchema), reviewController.createReview);
router.put('/:id', validateRequest(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.get('/user/my-reviews', reviewController.getUserReviews);

export default router;
