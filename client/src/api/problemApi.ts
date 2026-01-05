import api from './index';
import type { Problem, ProblemSummary, Difficulty, Concept } from '@flowcode/shared';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ProblemFilters {
  page?: number;
  limit?: number;
  difficulty?: Difficulty;
  concepts?: Concept[];
  search?: string;
  sortBy?: 'popularity' | 'successRate' | 'createdAt' | 'difficulty' | 'concept';
  sortOrder?: 'asc' | 'desc';
}

export const problemApi = {
  getProblems: async (
    filters: ProblemFilters = {}
  ): Promise<PaginatedResponse<ProblemSummary>> => {
    const params = new URLSearchParams();

    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.concepts?.length) params.set('concepts', filters.concepts.join(','));
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const response = await api.get<ApiResponse<PaginatedResponse<ProblemSummary>>>(
      `/problems?${params.toString()}`
    );
    return response.data.data;
  },

  getProblemBySlug: async (slug: string): Promise<Problem> => {
    const response = await api.get<ApiResponse<{ problem: Problem }>>(
      `/problems/${slug}`
    );
    return response.data.data.problem;
  },

  getHint: async (
    problemId: string,
    level: 1 | 2 | 3
  ): Promise<{ hint: string; level: number }> => {
    const response = await api.get<ApiResponse<{ hint: string; level: number }>>(
      `/problems/${problemId}/hints?level=${level}`
    );
    return response.data.data;
  },

  getStarterCode: async (
    problemId: string,
    language: string
  ): Promise<string> => {
    const response = await api.get<ApiResponse<{ starterCode: string }>>(
      `/problems/${problemId}/starter-code/${language}`
    );
    return response.data.data.starterCode;
  },

  getRandomProblem: async (filters?: {
    difficulty?: Difficulty;
    concepts?: Concept[];
  }): Promise<ProblemSummary> => {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    if (filters?.concepts?.length) params.set('concepts', filters.concepts.join(','));

    const response = await api.get<ApiResponse<{ problem: ProblemSummary }>>(
      `/problems/random?${params.toString()}`
    );
    return response.data.data.problem;
  },
};
