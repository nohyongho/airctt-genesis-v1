
export interface Merchant {
  id: string;
  name: string;
  businessName: string;
  contact: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const MERCHANTS_KEY = 'airctt_merchants';

export const merchantService = {
  getAll: (): Merchant[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(MERCHANTS_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getById: (id: string): Merchant | null => {
    const merchants = merchantService.getAll();
    return merchants.find(m => m.id === id) || null;
  },

  create: (merchant: Omit<Merchant, 'id' | 'createdAt' | 'updatedAt'>): Merchant => {
    const merchants = merchantService.getAll();
    
    const nameExists = merchants.some(
      m => m.name.toLowerCase() === merchant.name.toLowerCase()
    );
    
    if (nameExists) {
      throw new Error('이미 등록된 가맹점명입니다.');
    }

    const newMerchant: Merchant = {
      ...merchant,
      id: 'merchant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    merchants.push(newMerchant);
    localStorage.setItem(MERCHANTS_KEY, JSON.stringify(merchants));
    
    return newMerchant;
  },

  update: (id: string, updates: Partial<Omit<Merchant, 'id' | 'createdAt' | 'updatedAt'>>): Merchant => {
    const merchants = merchantService.getAll();
    const index = merchants.findIndex(m => m.id === id);
    
    if (index === -1) {
      throw new Error('가맹점을 찾을 수 없습니다.');
    }

    if (updates.name) {
      const nameExists = merchants.some(
        m => m.id !== id && m.name.toLowerCase() === updates.name!.toLowerCase()
      );
      
      if (nameExists) {
        throw new Error('이미 등록된 가맹점명입니다.');
      }
    }

    const updatedMerchant: Merchant = {
      ...merchants[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    merchants[index] = updatedMerchant;
    localStorage.setItem(MERCHANTS_KEY, JSON.stringify(merchants));
    
    return updatedMerchant;
  },

  delete: (id: string): void => {
    const merchants = merchantService.getAll();
    const filtered = merchants.filter(m => m.id !== id);
    
    if (filtered.length === merchants.length) {
      throw new Error('가맹점을 찾을 수 없습니다.');
    }
    
    localStorage.setItem(MERCHANTS_KEY, JSON.stringify(filtered));
  },

  search: (query: string): Merchant[] => {
    const merchants = merchantService.getAll();
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) return merchants;
    
    return merchants.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) ||
      m.businessName.toLowerCase().includes(lowerQuery) ||
      m.contact.toLowerCase().includes(lowerQuery)
    );
  },
};
