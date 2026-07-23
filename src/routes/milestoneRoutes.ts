import { Router } from 'express';
import { milestoneController } from '../controllers/milestoneController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', milestoneController.findAll);
router.get('/:id', milestoneController.findById);
router.get('/project/:projectId', milestoneController.findByProjectId);
router.post('/', milestoneController.create);
router.put('/:id', milestoneController.update);
router.delete('/:id', milestoneController.delete);

export default router;
