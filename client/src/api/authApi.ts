import api from './index';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@flowcode/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
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
};
