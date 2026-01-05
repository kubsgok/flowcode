import { Router } from 'express';
import {
  getProblems,
  getProblemBySlug,
  getProblemHint,
  getStarterCode,
  getRandomProblem,
} from '../controllers/problemController';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProblems);
router.get('/random', getRandomProblem);
router.get('/:slug', getProblemBySlug);

// Protected routes (need auth for hints to track usage)
router.get('/:id/hints', protect, getProblemHint);
router.get('/:id/starter-code/:language', getStarterCode);

export default router;
