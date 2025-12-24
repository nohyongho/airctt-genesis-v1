
import { UserProfile } from './consumer-types';

const CONSUMER_AUTH_KEY = 'airctt_consumer_session';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export const consumerAuthService = {
  // --- Session Management ---
  setSession: (session: AuthSession) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONSUMER_AUTH_KEY, JSON.stringify(session));
      // Also set for legacy mock compatibility if needed
      localStorage.setItem('airctt_consumer_user', JSON.stringify(session.user));
    }
  },

  getSession: (): AuthSession | null => {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem(CONSUMER_AUTH_KEY);
    return str ? JSON.parse(str) : null;
  },

  getUser: (): UserProfile | null => {
    const session = consumerAuthService.getSession();
    return session ? session.user : null;
  },

  logout: () => {
    localStorage.removeItem(CONSUMER_AUTH_KEY);
    localStorage.removeItem('airctt_consumer_user');
    window.location.href = '/consumer/login';
  },

  isAuthenticated: (): boolean => {
    return !!consumerAuthService.getSession();
  },

  // --- API Calls ---

  // 1. Fetch User Details using Token
  fetchUser: async (accessToken: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_KEY || ''
        }
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();

      // Map Supabase User to UserProfile
      return {
        id: data.id,
        email: data.email,
        name: data.user_metadata?.full_name || data.user_metadata?.name || data.email?.split('@')[0],
        avatarUrl: data.user_metadata?.avatar_url || data.user_metadata?.picture,
        provider: data.app_metadata?.provider || 'email',
        createdAt: data.created_at
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // 2. Email Login
  emailLogin: async (email: string, password: string): Promise<UserProfile> => {
    // API: POST /auth/v1/token?grant_type=password
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY || ''
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Login failed');

    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || email.split('@')[0],
      provider: 'EMAIL',
      createdAt: data.user.created_at
    };

    consumerAuthService.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user
    });

    return user;
  },

  // 3. OAuth Redirects
  signInWithOAuth: (provider: 'google' | 'kakao' | 'naver') => {
    if (!SUPABASE_URL) {
      console.error('Supabase URL missing');
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback`;
    // Use implicit flow by default or handled by Supabase
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`;
  },

  // 4. Magic Link (OTP)
  signInWithOtp: async (email: string): Promise<void> => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY || ''
      },
      body: JSON.stringify({ email, create_user: true })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.msg || data.error_description || 'Failed to send Magic Link');
    }
  },

  // Legacy Adapters (to keep existing UI working until fully refactored)
  googleLogin: async () => { consumerAuthService.signInWithOAuth('google'); return {} as any; },
  kakaoLogin: async () => { consumerAuthService.signInWithOAuth('kakao'); return {} as any; },
  // Naver support
  naverLogin: async () => { consumerAuthService.signInWithOAuth('naver'); return {} as any; }
};
