import { Router } from 'express';
import { deliveryController } from '../controllers/deliveryController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createDeliverySchema, updateDeliverySchema } from '../schemas/delivery.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', deliveryController.findAll);
router.get('/:id', deliveryController.findById);
router.get('/project/:projectId', deliveryController.findByProjectId);
router.post('/', validateRequest(createDeliverySchema), deliveryController.create);
router.put('/:id', validateRequest(updateDeliverySchema), deliveryController.update);
router.delete('/:id', deliveryController.delete);

export default router;
