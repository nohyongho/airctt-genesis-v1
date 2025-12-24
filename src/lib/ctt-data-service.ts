
const CTT_INITIALIZED_KEY = 'airctt_ctt_initialized';

export const cttDataService = {
  initialize: (): void => {
    if (typeof window === 'undefined') return;

    const initialized = localStorage.getItem(CTT_INITIALIZED_KEY);
    if (initialized) return;

    localStorage.setItem(CTT_INITIALIZED_KEY, 'true');
  },

  reset: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CTT_INITIALIZED_KEY);
  },

  getStoreCoupons: (storeId: string) => {
    const mockCoupons = [
      {
        id: 'coupon-001',
        store_id: storeId,
        title: 'Americano 1+1 Event',
        description: 'Buy one Americano and get one free.',
        discount_type: 'gift',
        discount_value: 0,
        start_at: '2024-12-19T00:00:00Z',
        end_at: '2025-01-18T23:59:59Z',
        status: 'active',
        terms_conditions: 'Limit one per person per day.',
        max_usage_count: 100,
        current_usage_count: 23,
        ar_link: '{ar_coupon_link_001}',
      },
    ];

    return mockCoupons;
  },

  getStoreEvents: (storeId: string) => {
    const mockEvents = [
      {
        id: 'event-001',
        store_id: storeId,
        title: '🎄 Christmas Special Event',
        description: 'Limited Christmas season menu launch!',
        event_type: 'special',
        discount_info: '15% off seasonal menu',
        start_at: '2024-12-19T00:00:00Z',
        end_at: '2025-01-13T23:59:59Z',
        status: 'active',
        banner_image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800',
      },
      {
        id: 'event-002',
        store_id: storeId,
        title: '☕ New Year Coffee Festival',
        description: 'Try our new year special blend coffee',
        event_type: 'promotion',
        discount_info: 'Free upgrade to large size',
        start_at: '2025-01-01T00:00:00Z',
        end_at: '2025-01-31T23:59:59Z',
        status: 'scheduled',
        banner_image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      },
    ];

    return mockEvents;
  },

  getStoreReviews: (storeId: string) => {
    const mockReviews = [
      {
        id: 'review-001',
        store_id: storeId,
        user_id: 'user-001',
        rating: 5,
        content: '커피 맛이 정말 훌륭해요! 분위기도 좋고 직원분들도 친절하세요.',
        images: ['https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400'],
        created_at: '2024-12-17T10:30:00Z',
        user_name: '김민수',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001',
      },
      {
        id: 'review-002',
        store_id: storeId,
        user_id: 'user-002',
        rating: 4,
        content: '가격 대비 만족스러워요. 재방문 의사 있습니다.',
        images: [],
        created_at: '2024-12-16T14:20:00Z',
        user_name: '이영희',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user002',
      },
      {
        id: 'review-003',
        store_id: storeId,
        user_id: 'user-003',
        rating: 5,
        content: '최고예요! 친구들에게 추천했어요.',
        images: [
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        ],
        created_at: '2024-12-15T09:15:00Z',
        user_name: '박철수',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user003',
      },
      {
        id: 'review-004',
        store_id: storeId,
        user_id: 'user-004',
        rating: 3,
        content: '보통이에요. 특별한 점은 없었어요.',
        images: [],
        created_at: '2024-12-14T16:45:00Z',
        user_name: '최지은',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user004',
      },
      {
        id: 'review-005',
        store_id: storeId,
        user_id: 'user-005',
        rating: 5,
        content: '매장이 깨끗하고 제품 퀄리티가 좋아요!',
        images: ['https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400'],
        created_at: '2024-12-13T11:00:00Z',
        user_name: '정수진',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user005',
      },
    ];

    return mockReviews;
  },

  getStoreDetail: (storeId: string) => {
    const store = {
      id: storeId,
      name: '카페 모카 강남점',
      category: '카페',
      rating_avg: 4.5,
      address: '서울 강남구 테헤란로 123',
      phone: '02-123-4567',
      description: '스페셜티 원두를 사용하는 프리미엄 카페입니다.',
      opening_hours: '09:00 - 22:00',
      latitude: 37.4979,
      longitude: 127.0276,
      images: [
        {
          id: 'image-001',
          store_id: storeId,
          image_url: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=800',
          is_primary: true,
        },
        {
          id: 'image-002',
          store_id: storeId,
          image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
          is_primary: false,
        },
        {
          id: 'image-003',
          store_id: storeId,
          image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
          is_primary: false,
        },
      ],
      available_coupons: [] as ReturnType<typeof cttDataService.getStoreCoupons>,
      active_events: [] as ReturnType<typeof cttDataService.getStoreEvents>,
      recent_reviews: [] as ReturnType<typeof cttDataService.getStoreReviews>,
    };

    store.available_coupons = cttDataService.getStoreCoupons(storeId);
    store.active_events = cttDataService.getStoreEvents(storeId);
    store.recent_reviews = cttDataService.getStoreReviews(storeId);

    return store;
  },
};
