
// ============================================================
// AIRCTT DEMO SAMPLE DATA (벤사/PG 시연용)
// ============================================================
// 📝 CTT V2.0 타입 정의
// 💡 이 파일의 타입들은 ctt-data-service.ts에서 사용됩니다.
// ============================================================

export interface CTTUser {
  id: string;
  email: string;
  role: 'consumer' | 'merchant' | 'admin' | 'staff';
  phone?: string;
  country_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface CTTStore {
  id: string;
  merchant_id: string;
  name: string;
  slug?: string;
  category: string;
  description?: string;
  rating_avg?: number;
  review_count?: number;
  lat?: number;
  lng?: number;
  address?: string;
  phone?: string;
  open_hours?: string;
  created_at: string;
  updated_at?: string;
}

export interface CTTStoreImage {
  id: string;
  store_id: string;
  image_url: string;
  display_order?: number;
  is_primary?: boolean;
  created_at: string;
}

export interface CTTCoupon {
  id: string;
  store_id: string;
  title: string;
  description?: string;
  discount_type: 'percent' | 'amount' | 'gift';
  discount_value: number;
  start_at: string;
  end_at: string;
  status: 'active' | 'scheduled' | 'expired' | 'hidden';
  terms_conditions?: string;
  max_usage_count?: number;
  current_usage_count?: number;
  ar_link?: string;
  created_at: string;
  updated_at?: string;
}

export interface CTTReview {
  id: string;
  store_id: string;
  user_id: string;
  rating: number;
  content?: string;
  images?: string[];
  created_at: string;
  updated_at?: string;
  user_name?: string;
  user_avatar?: string;
}

export interface CTTEvent {
  id: string;
  store_id: string;
  title: string;
  description?: string;
  event_type: 'discount' | 'promotion' | 'special';
  discount_info?: string;
  start_at: string;
  end_at: string;
  status: 'active' | 'scheduled' | 'ended';
  banner_image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface CTTStoreDetail extends CTTStore {
  images: CTTStoreImage[];
  active_events: CTTEvent[];
  available_coupons: CTTCoupon[];
  recent_reviews: CTTReview[];
  distance?: string;
}
