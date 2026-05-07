import { Router } from 'express';
import {
  createLeague, listLeagues, getLeague, joinLeague, leaveLeague, kickMember,
  updateLeague, deleteLeague, addAnnouncement, deleteAnnouncement, getLeagueStats,
} from '../controllers/leagueController';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';

const router = Router();

router.get('/', optionalAuthenticate, listLeagues);
router.get('/:id', optionalAuthenticate, getLeague);
router.get('/:id/stats', getLeagueStats);
router.post('/', authenticate, createLeague);
router.patch('/:id', authenticate, updateLeague);
router.delete('/:id', authenticate, deleteLeague);
router.post('/:id/join', authenticate, joinLeague);
router.delete('/:id/leave', authenticate, leaveLeague);
router.delete('/:id/members/:userId', authenticate, kickMember);
router.post('/:id/announcements', authenticate, addAnnouncement);
router.delete('/:id/announcements/:announcementId', authenticate, deleteAnnouncement);

export default router;