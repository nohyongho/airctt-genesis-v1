'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Ticket,
  Clock,
  ChevronRight,
  Navigation,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface NearbyCoupon {
  coupon_id: string;
  merchant_id: string;
  store_id: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  store_name: string;
  store_address: string;
  distance_km: number;
  valid_until: string;
}

interface NearbyCouponsProps {
  onCouponClick?: (coupon: NearbyCoupon) => void;
  maxItems?: number;
}

export default function NearbyCoupons({
  onCouponClick,
  maxItems = 10,
}: NearbyCouponsProps) {
  const [coupons, setCoupons] = useState<NearbyCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 위치 정보 가져오기
  const getLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('위치 권한이 거부되었습니다. 설정에서 허용해주세요.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('위치 정보를 가져올 수 없습니다.');
            break;
          case error.TIMEOUT:
            setLocationError('위치 요청 시간이 초과되었습니다.');
            break;
          default:
            setLocationError('위치를 가져오는데 실패했습니다.');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분 캐시
      }
    );
  };

  // 근처 쿠폰 조회
  const fetchNearbyCoupons = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/coupons/nearby?lat=${lat}&lng=${lng}&radius=5&limit=${maxItems}`
      );
      const result = await response.json();

      if (result.success) {
        setCoupons(result.data || []);
      } else {
        setError(result.error || '쿠폰을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyCoupons(location.lat, location.lng);
    }
  }, [location]);

  const handleRefresh = () => {
    if (location) {
      fetchNearbyCoupons(location.lat, location.lng);
    } else {
      getLocation();
    }
  };

  // 거리 포맷팅
  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  // 만료일 포맷팅
  const formatExpiry = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return '오늘 만료';
    if (diffDays === 1) return '내일 만료';
    if (diffDays <= 7) return `${diffDays}일 후 만료`;
    return `${date.getMonth() + 1}/${date.getDate()}까지`;
  };

  // 위치 권한 오류 화면
  if (locationError) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-800 font-medium mb-2">위치 정보 필요</p>
          <p className="text-amber-600 text-sm mb-4">{locationError}</p>
          <Button variant="outline" onClick={getLocation}>
            <Navigation className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 로딩 화면
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="ml-3 text-slate-600">
            {!location ? '위치 확인 중...' : '근처 쿠폰 검색 중...'}
          </span>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 쿠폰 없음
  if (coupons.length === 0) {
    return (
      <Card className="bg-slate-50">
        <CardContent className="p-6 text-center">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium mb-1">근처에 쿠폰이 없어요</p>
          <p className="text-slate-400 text-sm">조금 더 넓은 범위로 검색해보세요</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-900">내 주변 쿠폰</h3>
          <Badge variant="secondary" className="text-xs">
            {coupons.length}개
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* 쿠폰 리스트 */}
      <div className="space-y-3">
        <AnimatePresence>
          {coupons.map((coupon, index) => (
            <motion.div
              key={coupon.coupon_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onCouponClick?.(coupon)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 할인 배지 */}
                      <Badge
                        className={`mb-2 ${
                          coupon.discount_type === 'percent'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {coupon.discount_type === 'percent'
                          ? `${coupon.discount_value}% 할인`
                          : `${coupon.discount_value.toLocaleString()}원 할인`}
                      </Badge>

                      {/* 쿠폰 제목 */}
                      <h4 className="font-bold text-slate-900 mb-1">{coupon.title}</h4>

                      {/* 매장 정보 */}
                      <p className="text-sm text-slate-600 mb-2">{coupon.store_name}</p>

                      {/* 거리 & 만료일 */}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {formatDistance(coupon.distance_km)}
                        </span>
                        {coupon.valid_until && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatExpiry(coupon.valid_until)}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
