import { Router } from 'express';
import authRoutes from './authRoutes';
import problemRoutes from './problemRoutes';
import submissionRoutes from './submissionRoutes';
import challengeRoutes from './challengeRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/challenges', challengeRoutes);
router.use('/ai', aiRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
