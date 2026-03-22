import { Router } from 'express';
import { listingController } from '@/controllers/listingController';
import { authMiddleware } from '@/middleware/auth';
import { roleMiddleware } from '@/middleware/auth';
import { validateRequest, validateQuery, commonSchemas } from '@/middleware/validation';
import { createListingSchema, updateListingSchema } from '@/utils/validationSchemas';

const router = Router();

// Public routes
router.get('/', validateQuery(commonSchemas.pagination), listingController.getListings);
router.get('/featured', listingController.getFeaturedListings);
router.get('/search', validateQuery(commonSchemas.search), listingController.searchListings);
router.get('/:id', listingController.getListingById);

// Protected routes (hosts only)
router.post('/', authMiddleware, roleMiddleware(['HOST', 'ADMIN']), validateRequest(createListingSchema), listingController.createListing);
router.put('/:id', authMiddleware, validateRequest(updateListingSchema), listingController.updateListing);
router.delete('/:id', authMiddleware, listingController.deleteListing);
router.post('/:id/images', authMiddleware, listingController.uploadImages);
router.delete('/:id/images/:imageId', authMiddleware, listingController.deleteImage);

export default router;
