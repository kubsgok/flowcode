import api from './index';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@flowcode/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
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

export interface OnboardingStatus {
  onboardingComplete: boolean;
  preferredMode: 'guided' | 'practice' | null;
  hasSelfAssessment: boolean;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },

  updatePreferences: async (
    preferences: Partial<User['preferences']>
  ): Promise<User> => {
    const response = await api.patch<ApiResponse<{ user: User }>>(
      '/auth/preferences',
      preferences
    );
    return response.data.data.user;
  },

  refreshToken: async (refreshToken: string): Promise<string> => {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data.token;
  },

  getProblemStatus: async (): Promise<{ solved: string[]; attempted: string[] }> => {
    const response = await api.get<ApiResponse<{ solved: string[]; attempted: string[] }>>(
      '/auth/problem-status'
    );
    return response.data.data;
  },

  getOnboardingStatus: async (): Promise<OnboardingStatus> => {
    const response = await api.get<ApiResponse<OnboardingStatus>>(
      '/auth/onboarding-status'
    );
    return response.data.data;
  },

  completeOnboarding: async (
    mode: 'guided' | 'practice',
    selfAssessment?: SelfAssessment
  ): Promise<User> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/onboarding', {
      mode,
      selfAssessment,
    });
    return response.data.data.user;
  },

  setPreferredMode: async (mode: 'guided' | 'practice'): Promise<User> => {
    const response = await api.patch<ApiResponse<{ user: User }>>('/auth/mode', {
      mode,
    });
    return response.data.data.user;
  },
};
