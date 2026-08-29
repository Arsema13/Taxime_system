import { Router } from 'express';
import { timeTrackingController } from '../controllers/timeTracking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/running', timeTrackingController.getRunningTimer);
router.post('/:taskId/start', timeTrackingController.startTimer);
router.post('/stop', timeTrackingController.stopTimer);
router.get('/task/:taskId', timeTrackingController.getEntriesByTask);
router.get('/user/:userId', timeTrackingController.getEntriesByUser);
router.get('/my', timeTrackingController.getEntriesByUser);
router.delete('/:id', timeTrackingController.deleteEntry);

export default router;
