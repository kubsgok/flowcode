import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { problemService } from '../services/problemService';
import { AppError } from '../middleware/errorHandler';

const listProblemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  concepts: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['popularity', 'successRate', 'createdAt', 'difficulty'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const getProblems = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const params = listProblemsSchema.parse(req.query);

    const result = await problemService.getProblems(
      {
        difficulty: params.difficulty,
        concepts: params.concepts as any,
        search: params.search,
      },
      {
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const getProblemBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;

    if (!slug) {
      throw new AppError('Problem slug is required', 400);
    }

    const problem = await problemService.getProblemBySlug(slug);

    // Increment popularity when viewed
    await problemService.incrementPopularity((problem as any)._id.toString());

    // Transform _id to id for frontend
    const transformedProblem = {
      ...problem,
      id: (problem as any)._id.toString(),
    };

    res.status(200).json({
      success: true,
      data: { problem: transformedProblem },
    });
  }
);

export const getProblemHint = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { level } = req.query;

    if (!id) {
      throw new AppError('Problem ID is required', 400);
    }

    const hintLevel = parseInt(level as string, 10);
    if (![1, 2, 3].includes(hintLevel)) {
      throw new AppError('Invalid hint level. Must be 1, 2, or 3', 400);
    }

    const hint = await problemService.getHint(id, hintLevel as 1 | 2 | 3);

    res.status(200).json({
      success: true,
      data: { hint, level: hintLevel },
    });
  }
);

export const getStarterCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id, language } = req.params;

    if (!id || !language) {
      throw new AppError('Problem ID and language are required', 400);
    }

    const problem = await problemService.getProblemById(id);
    const starterCode = problem.starterCode?.get(language) || '';

    res.status(200).json({
      success: true,
      data: { starterCode, language },
    });
  }
);

export const getRandomProblem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { difficulty, concepts } = req.query;

    const problem = await problemService.getRandomProblem({
      difficulty: difficulty as any,
      concepts: concepts ? (concepts as string).split(',') as any : undefined,
    });

    if (!problem) {
      throw new AppError('No problems found matching criteria', 404);
    }

    res.status(200).json({
      success: true,
      data: { problem },
    });
  }
);
