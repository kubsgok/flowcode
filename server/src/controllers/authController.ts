import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';
import { generateToken, verifyRefreshToken } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);

    res.status(201).json({
      success: true,
      data: result,
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const getMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await authService.getUserById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      const decoded = verifyRefreshToken(token);
      const user = await authService.getUserById(decoded.userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const newToken = generateToken(decoded.userId);

      res.status(200).json({
        success: true,
        data: { token: newToken },
      });
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }
  }
);

export const updatePreferences = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const preferencesSchema = z.object({
      preferredLanguage: z.string().optional(),
      editorTheme: z.string().optional(),
      fontSize: z.number().min(10).max(24).optional(),
    });

    const validatedData = preferencesSchema.parse(req.body);
    const user = await authService.updatePreferences(req.userId, validatedData);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

export const getProblemStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const problemStatus = await authService.getUserProblemStatus(req.userId);

    res.status(200).json({
      success: true,
      data: problemStatus,
    });
  }
);

// Self-assessment schema (1-5 ratings for each concept)
const selfAssessmentSchema = z.object({
  arrays: z.number().min(1).max(5),
  strings: z.number().min(1).max(5),
  hashmaps: z.number().min(1).max(5),
  twoPointers: z.number().min(1).max(5),
  slidingWindow: z.number().min(1).max(5),
  linkedLists: z.number().min(1).max(5),
  trees: z.number().min(1).max(5),
  graphs: z.number().min(1).max(5),
  dynamicProgramming: z.number().min(1).max(5),
  recursion: z.number().min(1).max(5),
});

const onboardingSchema = z.object({
  mode: z.enum(['guided', 'practice']),
  selfAssessment: selfAssessmentSchema.optional(),
});

export const completeOnboarding = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const validatedData = onboardingSchema.parse(req.body);

    // For guided mode, self-assessment is required
    if (validatedData.mode === 'guided' && !validatedData.selfAssessment) {
      throw new AppError('Self-assessment is required for guided mode', 400);
    }

    const user = await authService.completeOnboarding(
      req.userId,
      validatedData.mode,
      validatedData.selfAssessment
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

export const getOnboardingStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const status = await authService.getOnboardingStatus(req.userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  }
);

export const setPreferredMode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Not authenticated', 401);
    }

    const modeSchema = z.object({
      mode: z.enum(['guided', 'practice']),
    });

    const validatedData = modeSchema.parse(req.body);
    const user = await authService.setPreferredMode(req.userId, validatedData.mode);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);
