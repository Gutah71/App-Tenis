import { Router } from 'express';
import userRoutes from './users';
import leagueRoutes from './leagues';
import tournamentRoutes from './tournaments';
import matchRoutes from './matches';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Tennis Tournament API v1' });
});

router.use('/users', userRoutes);
router.use('/leagues', leagueRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/tournaments/:tournamentId/matches', matchRoutes);

export default router;
