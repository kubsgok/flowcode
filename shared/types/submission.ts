export type SubmissionStatus =
  | 'pending'
  | 'running'
  | 'accepted'
  | 'wrong-answer'
  | 'time-limit-exceeded'
  | 'memory-limit-exceeded'
  | 'runtime-error'
  | 'compilation-error';

export interface TestCaseResult {
  testCaseIndex: number;
  passed: boolean;
  input?: string;
  actualOutput?: string;
  expectedOutput?: string;
  executionTime?: number;
  memoryUsed?: number;
  error?: string;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  languageId: number;
  status: SubmissionStatus;
  testCaseResults: TestCaseResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime: number;
  memoryUsed: number;
  hintsUsed: number[];
  attemptNumber: number;
  submittedAt: Date;
  completedAt?: Date;
}

export interface RunCodeRequest {
  problemId: string;
  code: string;
  language: string;
  customInput?: string;
}

export interface SubmitCodeRequest {
  problemId: string;
  code: string;
  language: string;
  timeSpent: number;
}

export interface ExecutionResult {
  token: string;
  status: SubmissionStatus;
  results?: TestCaseResult[];
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
}

export interface RecommendedProblem {
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    concepts: string[];
  };
  score: number;
  reason: string;
  targetConcepts: string[];
}
