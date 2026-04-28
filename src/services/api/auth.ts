import { apiClient } from './client.ts';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const TOKEN_KEY = 'auth_tokens';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>('/token/', credentials);
    localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
    return data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getTokens: (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    const tokens = localStorage.getItem(TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  },

  refreshToken: async (): Promise<AuthTokens> => {
    const tokens = authApi.getTokens();
    if (!tokens) throw new Error('No refresh token');
    
    const { data } = await apiClient.post<AuthTokens>('/token/refresh/', {
      refresh: tokens.refresh,
    });
    
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ ...tokens, access: data.access }));
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me/');
    return data;
  },

  isAuthenticated: (): boolean => {
    return !!authApi.getTokens();
  },
};
