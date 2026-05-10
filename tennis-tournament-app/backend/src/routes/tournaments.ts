import { Router } from 'express';
import {
  createTournament, listTournaments, getTournament,
  registerPlayer, cancelRegistration, kickPlayer, updateStatus, updateTournament, deleteTournament, updatePrivacy,
} from '../controllers/tournamentController';
import { authenticate, optionalAuthenticate, requireOrganizer } from '../middlewares/auth';

const router = Router();

router.get('/', optionalAuthenticate, listTournaments);
router.get('/:id', optionalAuthenticate, getTournament);
router.post('/', authenticate, requireOrganizer, createTournament);
router.post('/:id/register', authenticate, registerPlayer);
router.delete('/:id/register', authenticate, cancelRegistration);
router.delete('/:id/registrations/:userId', authenticate, requireOrganizer, kickPlayer);
router.patch('/:id', authenticate, requireOrganizer, updateTournament);
router.patch('/:id/status', authenticate, requireOrganizer, updateStatus);
router.patch('/:id/privacy', authenticate, requireOrganizer, updatePrivacy);
router.delete('/:id', authenticate, requireOrganizer, deleteTournament);

export default router;