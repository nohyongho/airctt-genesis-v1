
import { FittingItem, FittingHistory } from './consumer-types';

export const fittingService = {
  getFittingItems: async (category?: string): Promise<FittingItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allItems: FittingItem[] = [
          {
            id: '1',
            name: '화이트 티셔츠',
            category: 'clothing',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
            price: 29000,
            brand: '패션스토어',
          },
          {
            id: '2',
            name: '블랙 후디',
            category: 'clothing',
            imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=400&fit=crop',
            price: 59000,
            brand: '패션스토어',
          },
          {
            id: '3',
            name: '화이트 스니커즈',
            category: 'shoes',
            imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
            price: 89000,
            brand: '슈즈마켓',
          },
          {
            id: '4',
            name: '블랙 러닝화',
            category: 'shoes',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop',
            price: 129000,
            brand: '슈즈마켓',
          },
          {
            id: '5',
            name: '베이지 캡',
            category: 'hats',
            imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=400&fit=crop',
            price: 25000,
            brand: '액세서리샵',
          },
          {
            id: '6',
            name: '블랙 비니',
            category: 'hats',
            imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=300&h=400&fit=crop',
            price: 19000,
            brand: '액세서리샵',
          },
        ];

        const filtered = category 
          ? allItems.filter(item => item.category === category)
          : allItems;
        
        resolve(filtered);
      }, 500);
    });
  },

  addToFittingHistory: async (itemId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const history = JSON.parse(localStorage.getItem('ar_fitting_history') || '[]');
        history.push({
          itemId,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('ar_fitting_history', JSON.stringify(history));
        resolve();
      }, 300);
    });
  },

  getFittingHistory: async (): Promise<FittingHistory[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const history = JSON.parse(localStorage.getItem('ar_fitting_history') || '[]');
        resolve(history);
      }, 300);
    });
  },

  startARFitting: async (itemId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Starting AR fitting for item:', itemId);
        resolve();
      }, 500);
    });
  },
};
