import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createMessageSchema } from '../schemas/message.schema';

const router = Router();

router.use(authMiddleware);

router.get('/contacts', messageController.findContacts);
router.get('/:userId', messageController.findConversation);
router.post('/', validateRequest(createMessageSchema), messageController.create);

export default router;
