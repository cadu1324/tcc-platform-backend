import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import projectRoutes from './projectRoutes';
import deliveryRoutes from './deliveryRoutes';
import milestoneRoutes from './milestoneRoutes';
import feedbackRoutes from './feedbackRoutes';
import notificationRoutes from './notificationRoutes';
import dashboardRoutes from './dashboardRoutes';
import messageRoutes from './messageRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/messages', messageRoutes);

export default router;
