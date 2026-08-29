import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema, updateCommentSchema } from '../validators/comment';

const router = Router();

router.use(authenticate);

router.get('/task/:taskId', commentController.getByTask);
router.post('/task/:taskId', validate(createCommentSchema), commentController.create);
router.put('/:id', validate(updateCommentSchema), commentController.update);
router.delete('/:id', commentController.delete);

export default router;
