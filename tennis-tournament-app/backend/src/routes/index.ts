import { Router } from 'express';
import { Request, Response } from 'express';
import userRoutes from './users';
import leagueRoutes from './leagues';
import tournamentRoutes from './tournaments';
import matchRoutes from './matches';
import { sendContactEmail } from '../services/emailService';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Tennis Tournament API v1' });
});

router.post('/contact', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'name, email y message son requeridos' });
      return;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Email no válido' });
      return;
    }
    await sendContactEmail(String(name).trim(), String(email).trim(), String(message).trim());
    res.json({ ok: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error al enviar' });
  }
});

router.use('/users', userRoutes);
router.use('/leagues', leagueRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/tournaments/:tournamentId/matches', matchRoutes);

export default router;
