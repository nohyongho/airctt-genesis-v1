
import { Store } from './consumer-types';

const STORES_KEY = 'airctt_stores';

const defaultStores: Store[] = [
  {
    id: 'store_1',
    name: '패션스토어 강남점',
    category: '패션',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    description: '최신 트렌드 패션 아이템을 만나보세요',
    locationText: '서울 강남구 테헤란로 123',
    latitude: 37.5012,
    longitude: 127.0396,
    openHours: '10:00 - 22:00',
    tags: ['패션', '의류', '액세서리'],
    contact: '02-1234-5678',
  },
  {
    id: 'store_2',
    name: '슈즈마켓 홍대점',
    category: '패션',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400',
    description: '다양한 브랜드의 신발을 한 곳에서',
    locationText: '서울 마포구 홍익로 45',
    latitude: 37.5563,
    longitude: 126.9236,
    openHours: '11:00 - 21:00',
    tags: ['신발', '스니커즈', '구두'],
    contact: '02-2345-6789',
  },
  {
    id: 'store_3',
    name: '카페 모카',
    category: '카페',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    description: '프리미엄 원두로 내린 커피',
    locationText: '서울 서초구 서초대로 78',
    latitude: 37.4923,
    longitude: 127.0292,
    openHours: '08:00 - 22:00',
    tags: ['커피', '디저트', '브런치'],
    contact: '02-3456-7890',
  },
  {
    id: 'store_4',
    name: '맛있는 식당',
    category: '식당',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    description: '정성을 담은 한식 요리',
    locationText: '서울 종로구 종로 100',
    latitude: 37.5704,
    longitude: 126.9831,
    openHours: '11:00 - 21:00',
    tags: ['한식', '점심', '저녁'],
    contact: '02-4567-8901',
  },
  {
    id: 'store_5',
    name: '뷰티샵 명동',
    category: '뷰티',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    description: '최신 뷰티 트렌드와 제품',
    locationText: '서울 중구 명동길 50',
    latitude: 37.5636,
    longitude: 126.9869,
    openHours: '10:00 - 21:00',
    tags: ['화장품', '스킨케어', '메이크업'],
    contact: '02-5678-9012',
  },
];

export const storeService = {
  getNearbyStores: async (): Promise<Store[]> => {
    if (typeof window === 'undefined') return defaultStores;
    
    const stored = localStorage.getItem(STORES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultStores;
      }
    }
    
    localStorage.setItem(STORES_KEY, JSON.stringify(defaultStores));
    return defaultStores;
  },

  getStoreById: async (id: string): Promise<Store | null> => {
    const stores = await storeService.getNearbyStores();
    return stores.find(s => s.id === id) || null;
  },

  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  formatDistance: (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  },
};
