
import { Coupon, PointHistory } from './consumer-types';

export const walletService = {
  // Helper to get headers
  getHeaders: () => {
    // Check local storage for session
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('airctt_consumer_session');
      if (session) {
        try {
          const { access_token } = JSON.parse(session);
          return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          };
        } catch (e) { console.error('Error parsing session', e); }
      }
    }
    return { 'Content-Type': 'application/json' };
  },

  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const res = await fetch('/api/wallet/my-coupons', {
        headers: walletService.getHeaders() as any
      });
      if (!res.ok) throw new Error('Failed to fetch coupons');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getPointBalance: async (): Promise<number> => {
    try {
      const res = await fetch('/api/wallet/my-balance', {
        headers: walletService.getHeaders() as any
      });
      if (!res.ok) throw new Error('Failed to fetch balance');
      const data = await res.json();
      return data.balance;
    } catch (e) {
      console.error(e);
      return 0;
    }
  },

  getPointHistory: async (): Promise<PointHistory[]> => {
    try {
      const res = await fetch('/api/wallet/my-history', {
        headers: walletService.getHeaders() as any
      });
      if (!res.ok) throw new Error('Failed to fetch history');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  useCoupon: async (couponId: string): Promise<boolean> => {
    try {
      // Use the API we made earlier
      const res = await fetch('/api/coupons/use', {
        method: 'POST',
        headers: walletService.getHeaders() as any,
        // Mock Store ID for now, or pass it if available
        body: JSON.stringify({
          coupon_issue_id: couponId,
          store_id: '00000000-0000-0000-0000-000000000000' // Placeholder Mock Store
        }),
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  addCoupon: async (coupon: Omit<Coupon, 'id' | 'status' | 'expiresAt'>): Promise<void> => {
    // In Real Flow, this is handled by backend (game finish -> reward claim).
    // Client-side 'addCoupon' is usually not needed unless it's a dev tool.
    // We'll leave it as non-op or log it, since the GameWindow now calls APIs directly.
    console.log('Client-side addCoupon called - deprecated in favor of API flow', coupon);
  },

  addPoints: async (amount: number, description: string): Promise<void> => {
    // Similar to addCoupon, this should be server-side.
    // But for dev testing, we can call the transaction API.
    try {
      await fetch('/api/wallet/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumer_id: '00000000-0000-0000-0000-000000000000',
          type: 'MANUAL_ADD',
          amount_points: amount
        })
      });
    } catch (e) {
      console.error(e);
    }
  },

  usePoints: async (amount: number, description: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/wallet/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumer_id: '00000000-0000-0000-0000-000000000000',
          type: 'MANUAL_USE',
          amount_points: -amount // Negative for usage
        })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
};

