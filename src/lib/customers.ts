
export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const CUSTOMERS_KEY = 'airctt_customers';

export const customerService = {
  getAll: (): Customer[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(CUSTOMERS_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getById: (id: string): Customer | null => {
    const customers = customerService.getAll();
    return customers.find(c => c.id === id) || null;
  },

  create: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const customers = customerService.getAll();
    
    const emailExists = customers.some(
      c => c.email.toLowerCase() === customer.email.toLowerCase()
    );
    
    if (emailExists) {
      throw new Error('이미 등록된 이메일입니다.');
    }

    const newCustomer: Customer = {
      ...customer,
      id: 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    
    return newCustomer;
  },

  update: (id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Customer => {
    const customers = customerService.getAll();
    const index = customers.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    if (updates.email) {
      const emailExists = customers.some(
        c => c.id !== id && c.email.toLowerCase() === updates.email!.toLowerCase()
      );
      
      if (emailExists) {
        throw new Error('이미 등록된 이메일입니다.');
      }
    }

    const updatedCustomer: Customer = {
      ...customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    customers[index] = updatedCustomer;
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    
    return updatedCustomer;
  },

  delete: (id: string): void => {
    const customers = customerService.getAll();
    const filtered = customers.filter(c => c.id !== id);
    
    if (filtered.length === customers.length) {
      throw new Error('고객을 찾을 수 없습니다.');
    }
    
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered));
  },

  search: (query: string): Customer[] => {
    const customers = customerService.getAll();
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) return customers;
    
    return customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      (c.company && c.company.toLowerCase().includes(lowerQuery))
    );
  },
};
