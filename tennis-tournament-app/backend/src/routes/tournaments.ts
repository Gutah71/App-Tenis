import { Router } from 'express';
import {
  createTournament, listTournaments, getTournament,
  registerPlayer, cancelRegistration, updateStatus, deleteTournament,
} from '../controllers/tournamentController';
import { authenticate, requireOrganizer } from '../middlewares/auth';

const router = Router();

router.get('/', listTournaments);
router.get('/:id', getTournament);
router.post('/', authenticate, requireOrganizer, createTournament);
router.post('/:id/register', authenticate, registerPlayer);
router.delete('/:id/register', authenticate, cancelRegistration);
router.patch('/:id/status', authenticate, requireOrganizer, updateStatus);
router.delete('/:id', authenticate, requireOrganizer, deleteTournament);

export default router;