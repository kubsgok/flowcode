import api from './index';
import type { TestCaseResult } from '@flowcode/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface AIHintRequest {
  problemId: string;
  code: string;
  language: string;
  executionResult: {
    status: string;
    testCaseResults: TestCaseResult[];
    passedTestCases: number;
    totalTestCases: number;
    error?: string;
  };
}

interface AIHintResponse {
  hint: string;
  tokensUsed: number;
}

export const aiApi = {
  getAIHint: async (request: AIHintRequest): Promise<AIHintResponse> => {
    const response = await api.post<ApiResponse<AIHintResponse>>(
      '/ai/hint',
      request
    );
    return response.data.data;
  },
};
