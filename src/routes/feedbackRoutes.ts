import { Router } from 'express';
import { feedbackController } from '../controllers/feedbackController';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createFeedbackSchema } from '../schemas/feedback.schema';
import { UserType } from '../types/user.types';

const router = Router();

router.use(authMiddleware);

router.get('/delivery/:deliveryId', feedbackController.findByDeliveryId);
router.post('/', requireRole(UserType.ADVISOR), validateRequest(createFeedbackSchema), feedbackController.create);

export default router;
