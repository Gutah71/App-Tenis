import { Router } from 'express';
import {
  createLeague, listLeagues, getLeague, joinLeague,
  updateLeague, deleteLeague, addAnnouncement, deleteAnnouncement, getLeagueStats,
} from '../controllers/leagueController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', listLeagues);
router.get('/:id', getLeague);
router.get('/:id/stats', getLeagueStats);
router.post('/', authenticate, createLeague);
router.patch('/:id', authenticate, updateLeague);
router.delete('/:id', authenticate, deleteLeague);
router.post('/:id/join', authenticate, joinLeague);
router.post('/:id/announcements', authenticate, addAnnouncement);
router.delete('/:id/announcements/:announcementId', authenticate, deleteAnnouncement);

export default router;