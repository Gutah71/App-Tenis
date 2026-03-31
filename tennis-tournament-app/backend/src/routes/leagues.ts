import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as leagueController from '../controllers/league.controller';

const router = Router();

router.post('/', requireAuth, requireRole('ORGANIZER'), leagueController.create);
router.get('/mine', requireAuth, requireRole('ORGANIZER'), leagueController.getMine);
router.get('/', leagueController.getAll);
router.get('/:id', leagueController.getById);
router.post('/:id/join', requireAuth, requireRole('PLAYER'), leagueController.join);
router.post('/:id/leave', requireAuth, requireRole('PLAYER'), leagueController.leave);
router.patch('/:id', requireAuth, requireRole('ORGANIZER'), leagueController.update);
router.delete('/:id', requireAuth, requireRole('ORGANIZER'), leagueController.remove);

export default router;
