import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTemplateSchema, updateTemplateSchema } from '../validators/template';

const router = Router();

router.use(authenticate);

router.get('/', templateController.getAll);
router.get('/:id', templateController.getById);
router.post('/', authorize('ADMIN', 'TEAM_LEAD'), validate(createTemplateSchema), templateController.create);
router.put('/:id', authorize('ADMIN', 'TEAM_LEAD'), validate(updateTemplateSchema), templateController.update);
router.delete('/:id', authorize('ADMIN', 'TEAM_LEAD'), templateController.delete);

export default router;
