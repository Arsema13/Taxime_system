import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// User settings routes (all authenticated users)
router.get('/', settingsController.getUserSettings);
router.put('/', settingsController.updateUserSettings);

// System settings routes (admin only)
router.get('/system', authorize('COMMANDER'), settingsController.getAll);
router.put('/system', authorize('COMMANDER'), settingsController.set);
router.put('/system/bulk', authorize('COMMANDER'), settingsController.setMultiple);

export default router;
