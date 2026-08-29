import { Router } from 'express';
import { taskController } from '../controllers/task';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, taskQuerySchema, assignTaskSchema, statusChangeSchema, subtaskSchema, dependencySchema, bulkTaskSchema, createFromTemplateSchema } from '../validators/task';

const router = Router();

router.use(authenticate);

// Static routes (must come before /:id)
router.get('/workload/overview', taskController.getWorkload);
router.get('/count', taskController.getCount);
router.post('/bulk', authorize('COMMANDER', 'TEAM_LEAD'), validate(bulkTaskSchema), taskController.bulkUpdate);
router.post('/from-template', authorize('COMMANDER', 'TEAM_LEAD'), validate(createFromTemplateSchema), taskController.createFromTemplate);

// CRUD
router.get('/', validate(taskQuerySchema, 'query'), taskController.getAll);
router.post('/', validate(createTaskSchema), taskController.create);
router.get('/:id', taskController.getById);
router.put('/:id', validate(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);

// Assignment
router.post('/:id/assign', authorize('COMMANDER', 'TEAM_LEAD'), validate(assignTaskSchema), taskController.assign);

// Status workflow
router.post('/:id/status', validate(statusChangeSchema), taskController.changeStatus);
router.post('/:id/accept', taskController.acceptTask);
router.post('/:id/start', taskController.startTask);
router.post('/:id/submit', taskController.submitForReview);
router.post('/:id/approve', authorize('COMMANDER', 'TEAM_LEAD'), taskController.approveTask);
router.post('/:id/reject', authorize('COMMANDER', 'TEAM_LEAD'), taskController.rejectTask);

// Subtasks
router.post('/:id/subtasks', validate(subtaskSchema), taskController.addSubtask);
router.put('/subtasks/:subtaskId/toggle', taskController.toggleSubtask);

// Dependencies
router.post('/:id/dependencies', validate(dependencySchema), taskController.addDependency);
router.delete('/:id/dependencies/:dependsOnId', taskController.removeDependency);

// Favorites
router.post('/:id/favorite', taskController.toggleFavorite);

export default router;
