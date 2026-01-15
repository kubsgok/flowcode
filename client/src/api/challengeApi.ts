import api from './index';
import type { Concept, Difficulty } from '@flowcode/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface DailyChallenge {
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

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalChallengesCompleted: number;
  streakStatus: 'active' | 'at_risk' | 'broken';
}

export interface ChallengeCompletionResult extends StreakInfo {
  isDailyChallenge: boolean;
  streakChanged: boolean;
}

export interface RecommendedProblem {
  problemId: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  concepts: Concept[];
  reason: string;
  targetConcept: Concept;
  skillScore: number;
}

export interface SkillProfile {
  conceptScores: Record<string, number>;
  overallScore: number;
  totalProblemsSolved: number;
  totalProblemsAttempted: number;
}

export const challengeApi = {
  getDailyChallenge: async (): Promise<DailyChallenge | null> => {
    const response = await api.get<ApiResponse<{ challenge: DailyChallenge | null }>>(
      '/challenges/daily'
    );
    return response.data.data.challenge;
  },

  completeChallenge: async (problemId: string): Promise<ChallengeCompletionResult> => {
    const response = await api.post<ApiResponse<{ streakInfo: ChallengeCompletionResult }>>(
      '/challenges/complete',
      { problemId }
    );
    return response.data.data.streakInfo;
  },

  getStreakInfo: async (): Promise<StreakInfo> => {
    const response = await api.get<ApiResponse<{ streakInfo: StreakInfo }>>(
      '/challenges/streak'
    );
    return response.data.data.streakInfo;
  },

  getRecommendedProblems: async (limit: number = 3): Promise<RecommendedProblem[]> => {
    const response = await api.get<ApiResponse<{ recommendations: RecommendedProblem[] }>>(
      `/challenges/recommendations?limit=${limit}`
    );
    return response.data.data.recommendations;
  },

  getSkillProfile: async (): Promise<SkillProfile> => {
    const response = await api.get<ApiResponse<SkillProfile>>('/challenges/skills');
    return response.data.data;
  },
};
