import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { messageController } from '../controllers/messageController';

const router = Router();

router.use(authMiddleware);
router.get('/conversations', messageController.getConversations);
router.get('/thread/:userId', messageController.getThread);
router.post('/', messageController.sendMessage);
router.patch('/conversations/:userId/read', messageController.markConversationAsRead);
router.delete('/conversations/:userId', messageController.deleteConversation);

export default router;
