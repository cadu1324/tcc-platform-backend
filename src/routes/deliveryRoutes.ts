import { Router } from 'express';
import multer from 'multer';
import { deliveryController } from '../controllers/deliveryController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createDeliverySchema, updateDeliverySchema } from '../schemas/delivery.schema';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

router.use(authMiddleware);

router.get('/', deliveryController.findAll);
router.get('/:id', deliveryController.findById);
router.get('/:id/file', deliveryController.downloadFile);
router.get('/project/:projectId', deliveryController.findByProjectId);
router.post('/', validateRequest(createDeliverySchema), deliveryController.create);
router.post('/:id/submission', upload.single('file'), deliveryController.submit);
router.put('/:id', validateRequest(updateDeliverySchema), deliveryController.update);
router.delete('/:id', deliveryController.delete);

export default router;
