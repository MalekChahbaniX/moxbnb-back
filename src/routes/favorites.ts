import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { favoritesController } from '../controllers/favoritesController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', favoritesController.getFavorites);
router.post('/', favoritesController.addToFavorites);
router.delete('/:favoriteId', favoritesController.removeFromFavorites);
router.get('/check', favoritesController.checkFavorite);

export default router;
