import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { UserType } from '../types/user.types';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(UserType.ADMIN), userController.findAll);
router.get('/:id', userController.findById);
router.post('/', requireRole(UserType.ADMIN), validateRequest(createUserSchema), userController.create);
router.put('/:id', validateRequest(updateUserSchema), userController.update);
router.delete('/:id', requireRole(UserType.ADMIN), userController.delete);

export default router;
