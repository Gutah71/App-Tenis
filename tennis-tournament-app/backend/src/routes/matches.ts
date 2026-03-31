import { Router } from 'express';
import {
  generateBracket,
  getMatches,
  reportResult,
  confirmResult,
  disputeResult,
} from '../controllers/matchController';
import { authenticate } from '../middlewares/auth';

const router = Router({ mergeParams: true });

// /api/tournaments/:tournamentId/matches
router.get('/', getMatches);
router.post('/bracket', authenticate, generateBracket);
router.post('/:matchId/report', authenticate, reportResult);
router.post('/:matchId/confirm', authenticate, confirmResult);
router.post('/:matchId/dispute', authenticate, disputeResult);

export default router;
