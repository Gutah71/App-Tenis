import { Router } from 'express';
import { register, login, getProfile, updateName, updateEmail, updateNotifications, getStats, getMyTournaments, getMyLeagues, getMyMatches, getPublicProfile } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateName);
router.patch('/me/email', authenticate, updateEmail);
router.patch('/me/notifications', authenticate, updateNotifications);
router.get('/me/stats', authenticate, getStats);
router.get('/me/tournaments', authenticate, getMyTournaments);
router.get('/me/leagues', authenticate, getMyLeagues);
router.get('/me/matches', authenticate, getMyMatches);
router.get('/:id', getPublicProfile);

export default router;
