import api from './index';
import type { Submission, SubmissionStatus, TestCaseResult } from '@flowcode/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ExecutionResult {
  submissionId: string;
  status: SubmissionStatus;
  testCaseResults: TestCaseResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime: number;
  memoryUsed: number;
  error?: string;
}

interface RunCodeParams {
  problemId: string;
  code: string;
  language: string;
  customInput?: string;
}

interface SubmitCodeParams {
  problemId: string;
  code: string;
  language: string;
  timeSpent: number;
  hintsUsed?: number[];
}

export const submissionApi = {
  runCode: async (params: RunCodeParams): Promise<ExecutionResult> => {
    const response = await api.post<ApiResponse<ExecutionResult>>(
      '/submissions/run',
      params
    );
    return response.data.data;
  },

  submitCode: async (params: SubmitCodeParams): Promise<ExecutionResult> => {
    const response = await api.post<ApiResponse<ExecutionResult>>(
      '/submissions/submit',
      params
    );
    return response.data.data;
  },

  getSubmission: async (id: string): Promise<Submission> => {
    const response = await api.get<ApiResponse<{ submission: Submission }>>(
      `/submissions/${id}`
    );
    return response.data.data.submission;
  },

  getHistory: async (problemId?: string, limit?: number): Promise<Submission[]> => {
    const params = new URLSearchParams();
    if (problemId) params.set('problemId', problemId);
    if (limit) params.set('limit', String(limit));

    const response = await api.get<ApiResponse<{ submissions: Submission[] }>>(
      `/submissions/history?${params.toString()}`
    );
    return response.data.data.submissions;
  },

  getLatestSubmission: async (problemId: string): Promise<Submission | null> => {
    const response = await api.get<ApiResponse<{ submission: Submission | null }>>(
      `/submissions/latest/${problemId}`
    );
    return response.data.data.submission;
  },
};
