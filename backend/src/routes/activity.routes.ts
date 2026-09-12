import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/task/:taskId', activityController.getByTask);
router.get('/recent', activityController.getRecentActivity);
router.get('/export', authorize('ADMIN', 'TEAM_LEAD'), activityController.exportActivities);
router.get('/audit', authorize('ADMIN'), activityController.getAuditLogs);

export default router;
