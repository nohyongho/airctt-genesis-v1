
export type MerchantType = 'KARAOKE' | 'RESTAURANT' | 'CAFE' | 'RETAIL' | 'SERVICE' | 'OTHER';
export type CouponStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface MerchantProfile {
  id: string;
  name: string;
  type: MerchantType;
  businessNumber: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  openingHours?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Outlet {
  id: string;
  merchantId: string;
  name: string;
  address: string;
  phone: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface MerchantCoupon {
  id: string;
  merchantId: string;
  outletId?: string;
  code: string;
  title: string;
  name?: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  imageUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  validFrom: string;
  validUntil: string;
  totalQuantity: number;
  usedQuantity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  couponCode: string;
  couponTitle: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  usedAt: string;
  status: CouponStatus;
}

export interface MerchantOrder {
  id: string;
  merchantId: string;
  outletId: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponId?: string;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface TopUpHistory {
  id: string;
  merchantId: string;
  amount: number;
  method: 'CARD' | 'BANK_TRANSFER' | 'CASH';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
}
