import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { openaiService } from '../services/openaiService';
import { problemService } from '../services/problemService';
import { AppError } from '../middleware/errorHandler';

const testCaseResultSchema = z.object({
  testCaseIndex: z.number(),
  passed: z.boolean(),
  input: z.string().optional(),
  actualOutput: z.string().optional(),
  expectedOutput: z.string().optional(),
  executionTime: z.number().optional(),
  memoryUsed: z.number().optional(),
  error: z.string().optional(),
});

const aiHintRequestSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  executionResult: z.object({
    status: z.string(),
    testCaseResults: z.array(testCaseResultSchema),
    passedTestCases: z.number(),
    totalTestCases: z.number(),
    error: z.string().optional(),
  }),
});

export const getAIHint = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const validatedData = aiHintRequestSchema.parse(req.body);

    // Fetch problem details for context
    const problem = await problemService.getProblemById(validatedData.problemId);

    // Generate AI hint
    const result = await openaiService.generateHint({
      problemTitle: problem.title,
      problemDescription: problem.description,
      constraints: problem.constraints || [],
      userCode: validatedData.code,
      language: validatedData.language,
      executionResult: validatedData.executionResult,
    });

    res.status(200).json({
      success: true,
      data: {
        hint: result.hint,
        tokensUsed: result.tokensUsed,
      },
    });
  }
);
