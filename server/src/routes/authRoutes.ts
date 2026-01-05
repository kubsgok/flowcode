import { Router } from 'express';
import {
  register,
  login,
  getMe,
  refreshToken,
  updatePreferences,
  getProblemStatus,
  completeOnboarding,
  getOnboardingStatus,
  setPreferredMode,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

router.get('/me', protect, getMe);
router.get('/problem-status', protect, getProblemStatus);
router.get('/onboarding-status', protect, getOnboardingStatus);
router.patch('/preferences', protect, updatePreferences);
router.post('/onboarding', protect, completeOnboarding);
router.patch('/mode', protect, setPreferredMode);

export default router;
