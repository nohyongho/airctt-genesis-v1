
export interface PointTransaction {
  id: string;
  customerId: string;
  customerName: string;
  points: number;
  type: 'earn' | 'use';
  description?: string;
  createdAt: string;
}

const POINTS_KEY = 'airctt_points';

export const pointService = {
  getAll: (): PointTransaction[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(POINTS_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getById: (id: string): PointTransaction | null => {
    const transactions = pointService.getAll();
    return transactions.find(t => t.id === id) || null;
  },

  getByCustomerId: (customerId: string): PointTransaction[] => {
    const transactions = pointService.getAll();
    return transactions.filter(t => t.customerId === customerId);
  },

  getCustomerBalance: (customerId: string): number => {
    const transactions = pointService.getByCustomerId(customerId);
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'earn' 
        ? balance + transaction.points 
        : balance - transaction.points;
    }, 0);
  },

  create: (transaction: Omit<PointTransaction, 'id' | 'createdAt'>): PointTransaction => {
    const transactions = pointService.getAll();

    if (transaction.points <= 0) {
      throw new Error('포인트는 0보다 커야 합니다.');
    }

    if (transaction.type === 'use') {
      const currentBalance = pointService.getCustomerBalance(transaction.customerId);
      if (currentBalance < transaction.points) {
        throw new Error('사용 가능한 포인트가 부족합니다.');
      }
    }

    const newTransaction: PointTransaction = {
      ...transaction,
      id: 'point_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    localStorage.setItem(POINTS_KEY, JSON.stringify(transactions));
    
    return newTransaction;
  },

  delete: (id: string): void => {
    const transactions = pointService.getAll();
    const filtered = transactions.filter(t => t.id !== id);
    
    if (filtered.length === transactions.length) {
      throw new Error('포인트 내역을 찾을 수 없습니다.');
    }
    
    localStorage.setItem(POINTS_KEY, JSON.stringify(filtered));
  },

  getRecentTransactions: (limit: number = 10): PointTransaction[] => {
    const transactions = pointService.getAll();
    return transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  getTotalPointsEarned: (): number => {
    const transactions = pointService.getAll();
    return transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.points, 0);
  },

  getTotalPointsUsed: (): number => {
    const transactions = pointService.getAll();
    return transactions
      .filter(t => t.type === 'use')
      .reduce((sum, t) => sum + t.points, 0);
  },
};
