import { Router } from 'express';

const router = Router();

// ── Placeholder routes – replace with real feature routers as you build them ──
router.get('/', (_req, res) => {
  res.json({ message: 'Tennis Tournament API v1' });
});

// Example:
// import userRoutes from './users';
// import tournamentRoutes from './tournaments';
// router.use('/users', userRoutes);
// router.use('/tournaments', tournamentRoutes);

export default router;
