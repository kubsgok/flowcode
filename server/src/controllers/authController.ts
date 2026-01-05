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
