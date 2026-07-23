import { Router } from 'express';
import { feedbackController } from '../controllers/feedbackController';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { UserType } from '../types/user.types';

const router = Router();

router.use(authMiddleware);

router.get('/delivery/:deliveryId', feedbackController.findByDeliveryId);
router.post('/', requireRole(UserType.ADVISOR), feedbackController.create);

export default router;
