import { Router } from 'express';
import {
  runCode,
  submitCode,
  getSubmission,
  getSubmissionHistory,
  getLatestSubmission,
} from '../controllers/submissionController';
import { protect } from '../middleware/auth';

const router = Router();

// All submission routes require authentication
router.use(protect);

router.post('/run', runCode);
router.post('/submit', submitCode);
router.get('/history', getSubmissionHistory);
router.get('/latest/:problemId', getLatestSubmission);
router.get('/:id', getSubmission);

export default router;
