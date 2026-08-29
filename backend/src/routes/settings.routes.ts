import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('COMMANDER'));

router.get('/', settingsController.getAll);
router.put('/', settingsController.set);
router.put('/bulk', settingsController.setMultiple);

export default router;
