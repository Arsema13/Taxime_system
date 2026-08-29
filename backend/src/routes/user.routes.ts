import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema, adminUpdateUserSchema, createUserSchema, userQuerySchema } from '../validators/user';

const router = Router();

router.use(authenticate);

router.get('/me/stats', userController.getMyStats);
router.put('/me', validate(updateUserSchema), userController.updateMe);
router.get('/', authorize('COMMANDER'), validate(userQuerySchema, 'query'), userController.getAll);
router.get('/:id', userController.getById);
router.get('/:id/stats', userController.getStats);
router.post('/', authorize('COMMANDER'), validate(createUserSchema), userController.create);
router.put('/:id', authorize('COMMANDER'), validate(adminUpdateUserSchema), userController.update);
router.put('/:id/deactivate', authorize('COMMANDER'), userController.deactivate);
router.put('/:id/activate', authorize('COMMANDER'), userController.activate);

export default router;
