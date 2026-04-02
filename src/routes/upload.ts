import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { uploadController } from '../controllers/uploadController';
import { validateRequest } from '../middleware/validation';
import { deleteFileSchema } from '../utils/validationSchemas';
import express from 'express';

const router = Router();

// Serve uploaded files statically
router.use('/uploads', express.static('uploads'));

// Public routes (if needed for file access)
router.get('/file/:filename', uploadController.getFileInfo);

// Protected routes
router.use(authMiddleware);
router.post('/single', uploadController.uploadSingle);
router.post('/multiple', uploadController.uploadMultiple);
router.delete('/file', validateRequest(deleteFileSchema), uploadController.deleteFile);

export default router;
