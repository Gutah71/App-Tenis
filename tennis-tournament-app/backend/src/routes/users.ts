import { Router } from 'express';
import { register, login, getProfile, getStats } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.get('/me/stats', authenticate, getStats);

export default router;
