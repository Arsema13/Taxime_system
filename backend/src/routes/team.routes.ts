import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTeamSchema, updateTeamSchema, addTeamMemberSchema, teamQuerySchema } from '../validators/team';

const router = Router();

router.use(authenticate);

router.get('/', validate(teamQuerySchema, 'query'), teamController.getAll);
router.get('/:id', teamController.getById);
router.post('/', authorize('ADMIN'), validate(createTeamSchema), teamController.create);
router.put('/:id', authorize('ADMIN'), validate(updateTeamSchema), teamController.update);
router.post('/:id/members', authorize('ADMIN', 'TEAM_LEAD'), validate(addTeamMemberSchema), teamController.addMember);
router.delete('/:id/members/:userId', authorize('ADMIN', 'TEAM_LEAD'), teamController.removeMember);
router.delete('/:id', authorize('ADMIN'), teamController.delete);

export default router;
