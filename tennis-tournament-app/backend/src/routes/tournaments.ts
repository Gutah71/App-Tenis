import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as tournamentController from '../controllers/tournament.controller';
import * as bracketController from '../controllers/bracket.controller';

const router = Router();

router.post('/', requireAuth, requireRole('ORGANIZER'), tournamentController.create);
router.get('/mine', requireAuth, requireRole('ORGANIZER'), tournamentController.getMine);
router.get('/', tournamentController.getAll);
router.get('/:id', tournamentController.getById);
router.post('/:id/join', requireAuth, requireRole('PLAYER'), tournamentController.join);
router.post('/:id/leave', requireAuth, requireRole('PLAYER'), tournamentController.leave);
router.patch('/:id', requireAuth, requireRole('ORGANIZER'), tournamentController.update);
router.delete('/:id', requireAuth, requireRole('ORGANIZER'), tournamentController.remove);

// Bracket
router.post('/:id/bracket', requireAuth, requireRole('ORGANIZER'), bracketController.generate);
router.get('/:id/matches', bracketController.getMatches);
router.post('/:id/matches/:matchId/result', requireAuth, requireRole('ORGANIZER'), bracketController.reportResult);

export default router;
