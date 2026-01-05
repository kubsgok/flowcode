import { Router } from 'express';
import authRoutes from './authRoutes';
import problemRoutes from './problemRoutes';
import submissionRoutes from './submissionRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
