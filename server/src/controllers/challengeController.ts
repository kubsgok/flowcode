import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { challengeService } from '../services/challengeService';
import { recommendationService } from '../services/recommendationService';
import { skillService } from '../services/skillService';
import { AppError } from '../middleware/errorHandler';

export const getDailyChallenge = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const challenge = await challengeService.getDailyChallenge(req.userId);

    res.status(200).json({
      success: true,
      data: { challenge },
    });
  }
);

export const completeChallenge = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const schema = z.object({
      problemId: z.string(),
    });

    const { problemId } = schema.parse(req.body);
    const streakInfo = await challengeService.completeChallenge(req.userId, problemId);

    res.status(200).json({
      success: true,
      data: { streakInfo },
    });
  }
);

export const getStreakInfo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const streakInfo = await challengeService.getStreakInfo(req.userId);

    res.status(200).json({
      success: true,
      data: { streakInfo },
    });
  }
);

export const getRecommendedProblems = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const limit = parseInt(req.query.limit as string) || 3;
    const recommendations = await recommendationService.getRecommendedProblems(
      req.userId,
      Math.min(limit, 10)
    );

    res.status(200).json({
      success: true,
      data: { recommendations },
    });
  }
);

export const getSkillProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const conceptScores = await skillService.getAllConceptScores(req.userId);
    const profile = await skillService.getSkillProfile(req.userId);

    res.status(200).json({
      success: true,
      data: {
        conceptScores,
        overallScore: profile?.overallScore || 0,
        totalProblemsSolved: profile?.totalProblemsSolved || 0,
        totalProblemsAttempted: profile?.totalProblemsAttempted || 0,
      },
    });
  }
);
