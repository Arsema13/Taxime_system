import { Router } from 'express';
import { savedFilterController } from '../controllers/savedFilter.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', savedFilterController.getAll);
router.post('/', savedFilterController.create);
router.delete('/:id', savedFilterController.delete);

export default router;
