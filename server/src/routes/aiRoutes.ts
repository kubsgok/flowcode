import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getAIHint } from '../controllers/aiHintController';
import { protect } from '../middleware/auth';
import { config } from '../config/env';

const router = Router();

// Stricter rate limiting for AI endpoints (10 requests per hour per user)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI hints per hour
  keyGenerator: (req) => (req as any).userId || req.ip || 'unknown',
  message: {
    success: false,
    error: { message: 'AI hint limit reached (10/hour). Please try again later.' },
  },
  skip: () => config.nodeEnv === 'development', // Disable in development
});

// POST /api/ai/hint - Generate personalized AI hint
router.post('/hint', protect, aiRateLimiter, getAIHint);

export default router;
