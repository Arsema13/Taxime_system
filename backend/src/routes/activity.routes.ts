import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/task/:taskId', activityController.getByTask);
router.get('/recent', activityController.getRecentActivity);
router.get('/audit', authorize('COMMANDER'), activityController.getAuditLogs);

export default router;
