import { User, IUser, ISelfAssessment } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { skillService } from './skillService';

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResult {
  user: Omit<IUser, 'passwordHash'>;
  token: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResult> {
    const { email, password, displayName } = data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash: password,
      displayName,
    });

    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userResponse = user.toObject() as any;
    delete userResponse.passwordHash;

    return {
      user: userResponse as Omit<IUser, 'passwordHash'>,
      token,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash'
    );

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userResponse = user.toObject() as any;
    delete userResponse.passwordHash;

    return {
      user: userResponse as Omit<IUser, 'passwordHash'>,
      token,
      refreshToken,
    };
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-passwordHash');
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<IUser['preferences']>
  ): Promise<IUser | null> {
    const updateData: Record<string, unknown> = {};

    if (preferences.preferredLanguage !== undefined) {
      updateData['preferences.preferredLanguage'] = preferences.preferredLanguage;
    }
    if (preferences.editorTheme !== undefined) {
      updateData['preferences.editorTheme'] = preferences.editorTheme;
    }
    if (preferences.fontSize !== undefined) {
      updateData['preferences.fontSize'] = preferences.fontSize;
    }

    return User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');
  }

  async getUserProblemStatus(
    userId: string
  ): Promise<{ solved: string[]; attempted: string[] }> {
    const user = await User.findById(userId)
      .select('solvedProblems attemptedProblems')
      .lean();

    if (!user) {
      return { solved: [], attempted: [] };
    }

    return {
      solved: (user.solvedProblems || []).map((id) => id.toString()),
      attempted: (user.attemptedProblems || []).map((id) => id.toString()),
    };
  }

  /**
   * Set user's preferred mode (guided or practice)
   */
  async setPreferredMode(
    userId: string,
    mode: 'guided' | 'practice'
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { preferredMode: mode },
      { new: true, runValidators: true }
    ).select('-passwordHash');
  }

  /**
   * Complete onboarding with self-assessment (for guided mode)
   * This also initializes the user's skill profile based on their self-assessment
   */
  async completeOnboarding(
    userId: string,
    mode: 'guided' | 'practice',
    selfAssessment?: ISelfAssessment
  ): Promise<IUser | null> {
    const updateData: Record<string, unknown> = {
      preferredMode: mode,
      onboardingComplete: true,
    };

    if (selfAssessment) {
      updateData.selfAssessment = selfAssessment;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    // If guided mode with self-assessment, initialize skill profile
    if (user && mode === 'guided' && selfAssessment) {
      await skillService.initializeFromSelfAssessment(userId, selfAssessment);
    }

    return user;
  }

  /**
   * Get user's onboarding status
   */
  async getOnboardingStatus(userId: string): Promise<{
    onboardingComplete: boolean;
    preferredMode: 'guided' | 'practice' | null;
    hasSelfAssessment: boolean;
  }> {
    const user = await User.findById(userId)
      .select('onboardingComplete preferredMode selfAssessment')
      .lean();

    if (!user) {
      return {
        onboardingComplete: false,
        preferredMode: null,
        hasSelfAssessment: false,
      };
    }

    return {
      onboardingComplete: user.onboardingComplete || false,
      preferredMode: user.preferredMode || null,
      hasSelfAssessment: !!user.selfAssessment,
    };
  }
}

export const authService = new AuthService();
