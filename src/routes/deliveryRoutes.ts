import { Router } from 'express';
import { deliveryController } from '../controllers/deliveryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', deliveryController.findAll);
router.get('/:id', deliveryController.findById);
router.get('/project/:projectId', deliveryController.findByProjectId);
router.post('/', deliveryController.create);
router.put('/:id', deliveryController.update);
router.delete('/:id', deliveryController.delete);

export default router;
