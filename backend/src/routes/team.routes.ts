import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTeamSchema, updateTeamSchema, addTeamMemberSchema, teamQuerySchema } from '../validators/team';

const router = Router();

router.use(authenticate);

router.get('/', validate(teamQuerySchema, 'query'), teamController.getAll);
router.get('/:id', teamController.getById);
router.post('/', authorize('COMMANDER'), validate(createTeamSchema), teamController.create);
router.put('/:id', authorize('COMMANDER'), validate(updateTeamSchema), teamController.update);
router.post('/:id/members', authorize('COMMANDER', 'TEAM_LEAD'), validate(addTeamMemberSchema), teamController.addMember);
router.delete('/:id/members/:userId', authorize('COMMANDER', 'TEAM_LEAD'), teamController.removeMember);
router.delete('/:id', authorize('COMMANDER'), teamController.delete);

export default router;
