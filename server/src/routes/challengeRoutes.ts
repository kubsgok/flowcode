import { Router } from 'express';
import {
  getDailyChallenge,
  completeChallenge,
  getStreakInfo,
  getRecommendedProblems,
  getSkillProfile,
} from '../controllers/challengeController';
import { protect } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

// Daily challenge
router.get('/daily', getDailyChallenge);
router.post('/complete', completeChallenge);

// Streak info
router.get('/streak', getStreakInfo);

// Recommendations
router.get('/recommendations', getRecommendedProblems);

// Skill profile
router.get('/skills', getSkillProfile);

export default router;
