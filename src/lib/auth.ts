
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

const AUTH_KEY = 'airctt_auth_user';

export const authService = {
  login: (user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
    }
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem(AUTH_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return authService.getUser() !== null;
  },

  simulateGoogleLogin: (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: 'user_' + Date.now(),
          email: 'demo@airctt.com',
          name: 'AIRCTT Demo User',
          picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        };
        resolve(mockUser);
      }, 1000);
    });
  },
};
