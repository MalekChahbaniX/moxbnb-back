import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { promotionController } from '../controllers/promotionController';

const router = Router();

router.get('/public', promotionController.getPublicOffers);
router.get('/mine', authMiddleware, roleMiddleware(['HOST', 'PROVIDER', 'ADMIN']), promotionController.getManagedOffers);
router.patch('/offers/:type/:id', authMiddleware, roleMiddleware(['HOST', 'PROVIDER', 'ADMIN']), promotionController.updateOffer);

router.post('/validate', authMiddleware, promotionController.validateCode);
router.get('/codes', authMiddleware, roleMiddleware(['ADMIN']), promotionController.listCodes);
router.post('/codes', authMiddleware, roleMiddleware(['ADMIN']), promotionController.createCode);
router.put('/codes/:id', authMiddleware, roleMiddleware(['ADMIN']), promotionController.updateCode);
router.delete('/codes/:id', authMiddleware, roleMiddleware(['ADMIN']), promotionController.deleteCode);

export default router;
