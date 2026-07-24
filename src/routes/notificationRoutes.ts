import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.findMine);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
