import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { submissionService } from '../services/submissionService';
import { AppError } from '../middleware/errorHandler';

const runCodeSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  customInput: z.string().optional(),
});

const submitCodeSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  timeSpent: z.number().min(0).default(0),
  hintsUsed: z.array(z.number()).optional(),
});

export const runCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const validatedData = runCodeSchema.parse(req.body);

    const result = await submissionService.runCode({
      userId: req.userId,
      problemId: validatedData.problemId,
      code: validatedData.code,
      language: validatedData.language,
      customInput: validatedData.customInput,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const submitCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const validatedData = submitCodeSchema.parse(req.body);

    const result = await submissionService.submitCode({
      userId: req.userId,
      problemId: validatedData.problemId,
      code: validatedData.code,
      language: validatedData.language,
      timeSpent: validatedData.timeSpent,
      hintsUsed: validatedData.hintsUsed,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const getSubmission = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Submission ID is required', 400);
    }

    const submission = await submissionService.getSubmission(id);

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { submission },
    });
  }
);

export const getSubmissionHistory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const { problemId, limit } = req.query;

    const submissions = await submissionService.getSubmissionHistory(
      req.userId,
      problemId as string | undefined,
      limit ? parseInt(limit as string, 10) : 20
    );

    res.status(200).json({
      success: true,
      data: { submissions },
    });
  }
);

export const getLatestSubmission = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const { problemId } = req.params;

    if (!problemId) {
      throw new AppError('Problem ID is required', 400);
    }

    const submission = await submissionService.getLatestSubmission(
      req.userId,
      problemId
    );

    res.status(200).json({
      success: true,
      data: { submission },
    });
  }
);
