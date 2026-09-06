import { Router } from 'express';
import { submittedReportController } from '../controllers/submitted-report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Stats must be before /:id routes
router.get('/stats', submittedReportController.getStats);

router.get('/', submittedReportController.getAll);
router.get('/:id', submittedReportController.getById);
router.post('/', submittedReportController.create);
router.put('/:id', submittedReportController.update);
router.delete('/:id', submittedReportController.delete);
router.post('/:id/submit', submittedReportController.submit);
router.post('/:id/review', authorize('ADMIN', 'TEAM_LEAD'), submittedReportController.review);
router.get('/:id/export/pdf', submittedReportController.exportPdf);
router.get('/:id/export/excel', submittedReportController.exportExcel);
router.get('/:id/export/word', submittedReportController.exportWord);

export default router;
