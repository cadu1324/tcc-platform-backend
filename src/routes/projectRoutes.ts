import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', projectController.findAll);
router.get('/:id', projectController.findById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

export default router;
