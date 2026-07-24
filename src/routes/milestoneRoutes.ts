import { Router } from 'express';
import { milestoneController } from '../controllers/milestoneController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createMilestoneSchema, updateMilestoneSchema } from '../schemas/milestone.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', milestoneController.findAll);
router.get('/:id', milestoneController.findById);
router.get('/project/:projectId', milestoneController.findByProjectId);
router.post('/', validateRequest(createMilestoneSchema), milestoneController.create);
router.put('/:id', validateRequest(updateMilestoneSchema), milestoneController.update);
router.delete('/:id', milestoneController.delete);

export default router;
