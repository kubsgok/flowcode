import { Router } from 'express';
import {
  register,
  login,
  getMe,
  refreshToken,
  updatePreferences,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

router.get('/me', protect, getMe);
router.patch('/preferences', protect, updatePreferences);

export default router;
