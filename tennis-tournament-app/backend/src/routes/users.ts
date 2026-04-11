import { Router } from 'express';
import { register, login, getProfile, updateName, getStats, getMyTournaments } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateName);
router.get('/me/stats', authenticate, getStats);
router.get('/me/tournaments', authenticate, getMyTournaments);

export default router;
