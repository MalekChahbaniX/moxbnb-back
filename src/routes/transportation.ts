import express, { Router } from 'express';
import {
  getTransportationInfo,
  updateTransportationInfo,
  getNearbyTransport,
  getStudentListingsWithTransport,
  deleteTransportationInfo
} from '../controllers/transportation';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Routes publiques
router.get('/listing/:listingId', getTransportationInfo);
router.get('/nearby', getNearbyTransport);
router.get('/students/listings', getStudentListingsWithTransport);

// Routes protégées (admin/host)
router.put('/listing/:listingId', authMiddleware, updateTransportationInfo);
router.delete('/listing/:listingId', authMiddleware, deleteTransportationInfo);

export default router;
