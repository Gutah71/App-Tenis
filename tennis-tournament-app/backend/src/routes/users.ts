import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

router.patch('/profile', requireAuth, userController.updateProfile);
router.delete('/profile', requireAuth, userController.deleteAccount);
router.get('/my-leagues', requireAuth, userController.getMyLeagues);
router.get('/my-tournaments', requireAuth, userController.getMyTournaments);
router.get('/stats', requireAuth, userController.getStats);

export default router;
