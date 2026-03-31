import { Router } from 'express';
import authRoutes from './auth';
import leagueRoutes from './leagues';
import tournamentRoutes from './tournaments';
import userRoutes from './users';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Tennis Tournament API v1' });
});

// ── Feature routes ────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leagues', leagueRoutes);
router.use('/tournaments', tournamentRoutes);

export default router;
