import { Router } from 'express';
import { createLeague, listLeagues, getLeague, joinLeague } from '../controllers/leagueController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', listLeagues);
router.get('/:id', getLeague);
router.post('/', authenticate, createLeague);
router.post('/:id/join', authenticate, joinLeague);

export default router;
