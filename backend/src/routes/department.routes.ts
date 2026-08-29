import { Router } from 'express';
import { departmentController } from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department';

const router = Router();

router.use(authenticate);

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', authorize('COMMANDER'), validate(createDepartmentSchema), departmentController.create);
router.put('/:id', authorize('COMMANDER'), validate(updateDepartmentSchema), departmentController.update);
router.delete('/:id', authorize('COMMANDER'), departmentController.delete);

export default router;
