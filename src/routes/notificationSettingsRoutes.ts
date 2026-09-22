import { Router } from 'express';
import { notificationSettingsController } from '../controllers/notificationSettingsController';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { updateNotificationSettingsSchema } from '../schemas/notificationSettings.schema';
import { UserType } from '../types/user.types';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(UserType.ADMIN), notificationSettingsController.get);
router.put(
  '/',
  requireRole(UserType.ADMIN),
  validateRequest(updateNotificationSettingsSchema),
  notificationSettingsController.update
);

export default router;
