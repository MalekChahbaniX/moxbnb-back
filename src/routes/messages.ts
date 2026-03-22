import { Router } from 'express';

const router = Router();

// TODO: Implement messages routes
router.get('/', (req, res) => res.json({ message: 'messages route - TODO' }));

export default router;
