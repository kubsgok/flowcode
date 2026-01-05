import { Concept } from './problem';

export interface UserPreferences {
  preferredLanguage: string;
  editorTheme: string;
  fontSize: number;
}

export interface SkillSummary {
  overallLevel: number;
  weakestConcepts: Concept[];
  strongestConcepts: Concept[];
  lastActiveAt: Date;
}

export interface SelfAssessment {
  arrays: number;
  strings: number;
  hashmaps: number;
  twoPointers: number;
  slidingWindow: number;
  linkedLists: number;
  trees: number;
  graphs: number;
  dynamicProgramming: number;
  recursion: number;
}

export interface GuidedProgress {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date | null;
  totalChallengesCompleted: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  preferredMode: 'guided' | 'practice' | null;
  onboardingComplete: boolean;
  selfAssessment: SelfAssessment | null;
  guidedProgress: GuidedProgress;
  skillSummary: SkillSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface DifficultyStats {
  attempted: number;
  solved: number;
  avgTime: number;
}

export interface SkillData {
  concept: Concept;
  proficiencyScore: number;
  confidence: number;
  totalAttempts: number;
  successfulAttempts: number;
  averageHintsUsed: number;
  averageAttemptsToSolve: number;
  lastPracticedAt?: Date;
  easyStats: DifficultyStats;
  mediumStats: DifficultyStats;
  hardStats: DifficultyStats;
  recentPerformance: number[];
}

export interface UserSkillProfile {
  userId: string;
  skills: SkillData[];
  totalProblemsSolved: number;
  totalProblemsAttempted: number;
  currentStreak: number;
  longestStreak: number;
  lastCalculatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}
