import { Router, Request, Response } from 'express';
import { Problem } from '../models/Problem';
import { problems } from '../scripts/seedProblems';

const router = Router();

// Seed problems endpoint - only for development
router.post('/seed-problems', async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Seeding not allowed in production',
    });
  }

  try {
    console.log('Clearing existing problems...');
    await Problem.deleteMany({});

    console.log('Seeding problems...');
    for (const problemData of problems) {
      const problem = new Problem(problemData);
      await problem.save();
      console.log(`  Created: ${problem.title} (${problem.difficulty})`);
    }

    console.log(`Successfully seeded ${problems.length} problems!`);

    res.status(200).json({
      success: true,
      message: `Successfully seeded ${problems.length} problems`,
      count: problems.length,
    });
  } catch (error) {
    console.error('Error seeding problems:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding problems',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
