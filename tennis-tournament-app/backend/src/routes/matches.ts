import { Router } from 'express';
import {
  generateBracket,
  getMatches,
  scheduleMatch,
  reportResult,
  confirmResult,
  disputeResult,
  organizerResolve,
} from '../controllers/matchController';
import { authenticate } from '../middlewares/auth';

const router = Router({ mergeParams: true });

router.get('/', getMatches);
router.post('/bracket', authenticate, generateBracket);
router.patch('/:matchId/schedule', authenticate, scheduleMatch);
router.post('/:matchId/report', authenticate, reportResult);
router.post('/:matchId/confirm', authenticate, confirmResult);
router.post('/:matchId/dispute', authenticate, disputeResult);
router.post('/:matchId/organizer-resolve', authenticate, organizerResolve);

export default router;