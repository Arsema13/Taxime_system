import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema, adminUpdateUserSchema, createUserSchema, userQuerySchema } from '../validators/user';

const router = Router();

router.use(authenticate);

router.get('/me/stats', userController.getMyStats);
router.get('/search', userController.search);
router.put('/me', validate(updateUserSchema), userController.updateMe);
router.get('/', authorize('ADMIN', 'TEAM_LEAD'), validate(userQuerySchema, 'query'), userController.getAll);
router.get('/:id', userController.getById);
router.get('/:id/stats', userController.getStats);
router.post('/', authorize('ADMIN'), validate(createUserSchema), userController.create);
router.put('/:id', authorize('ADMIN'), validate(adminUpdateUserSchema), userController.update);
router.put('/:id/deactivate', authorize('ADMIN'), userController.deactivate);
router.put('/:id/activate', authorize('ADMIN'), userController.activate);
router.patch('/:id/deactivate', authorize('ADMIN'), userController.deactivate);
router.patch('/:id/activate', authorize('ADMIN'), userController.activate);

export default router;
