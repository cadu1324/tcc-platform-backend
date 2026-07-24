import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', projectController.findAll);
router.get('/:id', projectController.findById);
router.post('/', validateRequest(createProjectSchema), projectController.create);
router.put('/:id', validateRequest(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.delete);

export default router;
