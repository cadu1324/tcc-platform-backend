import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../schemas/auth.schema';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

export default router;
