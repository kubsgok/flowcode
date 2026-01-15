import { Types } from 'mongoose';
import { User } from '../models/User';
import { recommendationService } from './recommendationService';
import type { Concept, Difficulty } from '@flowcode/shared';

interface DailyChallenge {
  problemId: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  concepts: Concept[];
  reason: string;
  targetConcept: Concept;
  skillScore: number;
  isCompleted: boolean;
}

interface ChallengeCompletionResult extends StreakInfo {
  isDailyChallenge: boolean;
  streakChanged: boolean;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date | null;
  totalChallengesCompleted: number;
  streakStatus: 'active' | 'at_risk' | 'broken';
}

export class ChallengeService {
  /**
   * Get the daily challenge for a user
   * This uses the recommendation algorithm to pick an appropriate problem
   * The daily challenge is assigned once per day and stored in the user's progress
   */
  async getDailyChallenge(userId: string): Promise<DailyChallenge | null> {
    const user = await User.findById(userId).select('guidedProgress solvedProblems');
    const completedToday = this.isCompletedToday(user?.guidedProgress?.lastCompletedDate);
    const progress = user?.guidedProgress;

    // Check if we already have a daily challenge assigned for today
    const today = new Date();
    const hasExistingChallenge = progress?.dailyChallengeDate &&
      this.isSameDay(progress.dailyChallengeDate, today) &&
      progress?.dailyChallengeProblemId;

    if (hasExistingChallenge && progress?.dailyChallengeProblemId) {
      // Return the already assigned challenge
      const recommendation = await recommendationService.getRecommendedProblemById(
        userId,
        progress.dailyChallengeProblemId.toString()
      );

      if (recommendation) {
        return {
          ...recommendation,
          isCompleted: completedToday,
        };
      }
    }

    // Get a new recommended problem for today
    const recommendation = await recommendationService.getRecommendedProblem(userId);

    if (!recommendation) {
      return null;
    }

    // Store this as today's daily challenge
    await User.findByIdAndUpdate(userId, {
      'guidedProgress.dailyChallengeProblemId': new Types.ObjectId(recommendation.problemId),
      'guidedProgress.dailyChallengeDate': today,
    });

    return {
      ...recommendation,
      isCompleted: completedToday,
    };
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  /**
   * Complete a challenge (called when user solves a problem)
   * Only updates streak if the problem is the current daily challenge
   */
  async completeChallenge(userId: string, problemId: string): Promise<ChallengeCompletionResult> {
    const user = await User.findById(userId).select('guidedProgress');
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const progress = user.guidedProgress || {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      totalChallengesCompleted: 0,
      dailyChallengeProblemId: null,
      dailyChallengeDate: null,
    };

    // Check if this is the daily challenge
    const isDailyChallenge = progress.dailyChallengeProblemId &&
      progress.dailyChallengeDate &&
      this.isSameDay(progress.dailyChallengeDate, now) &&
      progress.dailyChallengeProblemId.toString() === problemId;

    // If not the daily challenge, just return current streak info without updating
    if (!isDailyChallenge) {
      const streakInfo = await this.getStreakInfo(progress);
      return {
        ...streakInfo,
        isDailyChallenge: false,
        streakChanged: false,
      };
    }

    // Check if already completed today
    if (this.isCompletedToday(progress.lastCompletedDate)) {
      // Already completed today - return current streak info
      const streakInfo = await this.getStreakInfo(progress);
      return {
        ...streakInfo,
        isDailyChallenge: true,
        streakChanged: false,
      };
    }

    // Calculate new streak
    const wasYesterday = this.wasYesterday(progress.lastCompletedDate);
    let newStreak: number;

    if (progress.lastCompletedDate === null) {
      // First ever completion
      newStreak = 1;
    } else if (wasYesterday) {
      // Continuing streak
      newStreak = progress.currentStreak + 1;
    } else {
      // Streak broken, starting new one
      newStreak = 1;
    }

    // Update user's guided progress
    const updatedProgress = {
      currentStreak: newStreak,
      longestStreak: Math.max(progress.longestStreak, newStreak),
      lastCompletedDate: now,
      totalChallengesCompleted: progress.totalChallengesCompleted + 1,
      dailyChallengeProblemId: progress.dailyChallengeProblemId,
      dailyChallengeDate: progress.dailyChallengeDate,
    };

    await User.findByIdAndUpdate(userId, {
      guidedProgress: updatedProgress,
    });

    const streakInfo = await this.getStreakInfo(updatedProgress);
    return {
      ...streakInfo,
      isDailyChallenge: true,
      streakChanged: true,
    };
  }

  /**
   * Get user's current streak information
   */
  async getStreakInfo(userId: string): Promise<StreakInfo>;
  async getStreakInfo(progress: {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: Date | null;
    totalChallengesCompleted: number;
  }): Promise<StreakInfo>;
  async getStreakInfo(
    userIdOrProgress:
      | string
      | {
          currentStreak: number;
          longestStreak: number;
          lastCompletedDate: Date | null;
          totalChallengesCompleted: number;
        }
  ): Promise<StreakInfo> {
    let progress: {
      currentStreak: number;
      longestStreak: number;
      lastCompletedDate: Date | null;
      totalChallengesCompleted: number;
    };

    if (typeof userIdOrProgress === 'string') {
      const user = await User.findById(userIdOrProgress).select('guidedProgress');
      progress = user?.guidedProgress || {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        totalChallengesCompleted: 0,
      };
    } else {
      progress = userIdOrProgress;
    }

    // Determine streak status
    let streakStatus: 'active' | 'at_risk' | 'broken' = 'broken';

    if (this.isCompletedToday(progress.lastCompletedDate)) {
      streakStatus = 'active';
    } else if (this.wasYesterday(progress.lastCompletedDate)) {
      streakStatus = 'at_risk'; // Needs to complete today to maintain streak
    } else if (progress.lastCompletedDate === null) {
      streakStatus = 'broken'; // Never started
    }

    // If streak is broken and there was a previous streak, reset to 0
    const displayStreak =
      streakStatus === 'broken' && progress.currentStreak > 0 ? 0 : progress.currentStreak;

    return {
      currentStreak: displayStreak,
      longestStreak: progress.longestStreak,
      lastCompletedDate: progress.lastCompletedDate,
      totalChallengesCompleted: progress.totalChallengesCompleted,
      streakStatus,
    };
  }

  /**
   * Check if the last completed date is today
   */
  private isCompletedToday(lastCompletedDate: Date | null | undefined): boolean {
    if (!lastCompletedDate) return false;

    const today = new Date();
    const lastCompleted = new Date(lastCompletedDate);

    return (
      today.getFullYear() === lastCompleted.getFullYear() &&
      today.getMonth() === lastCompleted.getMonth() &&
      today.getDate() === lastCompleted.getDate()
    );
  }

  /**
   * Check if the last completed date was yesterday
   */
  private wasYesterday(lastCompletedDate: Date | null | undefined): boolean {
    if (!lastCompletedDate) return false;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastCompleted = new Date(lastCompletedDate);

    return (
      yesterday.getFullYear() === lastCompleted.getFullYear() &&
      yesterday.getMonth() === lastCompleted.getMonth() &&
      yesterday.getDate() === lastCompleted.getDate()
    );
  }
}

export const challengeService = new ChallengeService();
