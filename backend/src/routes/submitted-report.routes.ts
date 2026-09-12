import { Router } from 'express';
import { submittedReportController } from '../controllers/submitted-report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Stats and Combine must be before /:id routes
router.get('/stats', submittedReportController.getStats);
router.post('/combine', authorize('ADMIN', 'TEAM_LEAD'), submittedReportController.combine);
router.post('/combine/export/word', authorize('ADMIN', 'TEAM_LEAD'), submittedReportController.exportCombinedWord);
router.post('/combine/export/pdf', authorize('ADMIN', 'TEAM_LEAD'), submittedReportController.exportCombinedPdf);
router.post('/combine/export/excel', authorize('ADMIN', 'TEAM_LEAD'), submittedReportController.exportCombinedExcel);

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
