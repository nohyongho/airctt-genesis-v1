
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Map, List, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StoreCard from '@/components/consumer/StoreCard';
import StoreMapView from '@/components/consumer/StoreMapView';
import LocationStatus from '@/components/consumer/LocationStatus';
import { useI18n } from '@/contexts/I18nContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { storeService } from '@/lib/store-service';
import { Store } from '@/lib/consumer-types';

type CategoryType = '전체' | '식당' | '카페' | '패션' | '뷰티' | '기타' | 'All' | 'Restaurant' | 'Cafe' | 'Fashion' | 'Beauty' | 'Others';

const CATEGORIES = {
  ko: ['전체', '식당', '카페', '패션', '뷰티', '기타'],
  en: ['All', 'Restaurant', 'Cafe', 'Fashion', 'Beauty', 'Others'],
};

const CATEGORY_MAP = {
  ko: {
    '전체': null,
    '식당': '식당',
    '카페': '카페',
    '패션': '패션',
    '뷰티': '뷰티',
    '기타': '기타',
  },
  en: {
    'All': null,
    'Restaurant': '식당',
    'Cafe': '카페',
    'Fashion': '패션',
    'Beauty': '뷰티',
    'Others': '기타',
  },
};

export default function StoresPage() {
  const { t, language } = useI18n();
  const [stores, setStores] = useState<Store[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    language === 'ko' ? '전체' : 'All'
  );
  
  // 실제 기기 위치 연동
  const { 
    latitude, 
    longitude, 
    loading: locationLoading, 
    error: locationError,
    refresh: refreshLocation 
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000, // 1분간 캐시
  });

  // 사용자 위치 (실제 위치 또는 기본값)
  const userLocation = useMemo(() => ({
    lat: latitude ?? 37.5665,
    lng: longitude ?? 126.9780,
  }), [latitude, longitude]);

  // 매장 데이터 로드 및 거리 계산
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await storeService.getNearbyStores();
      
      const storesWithDistance = data.map(store => ({
        ...store,
        distance: storeService.formatDistance(
          storeService.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            store.latitude,
            store.longitude
          )
        ),
      }));

      setStores(storesWithDistance);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation.lat, userLocation.lng]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // 위치 업데이트 핸들러
  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    // 위치가 업데이트되면 매장 목록 새로고침
    fetchStores();
  }, [fetchStores]);

  const filteredStores = useMemo(() => {
    let result = stores;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(store =>
        store.name.toLowerCase().includes(query) ||
        store.locationText.toLowerCase().includes(query) ||
        store.description.toLowerCase().includes(query)
      );
    }

    const categoryFilter = CATEGORY_MAP[language][selectedCategory as keyof typeof CATEGORY_MAP[typeof language]];
    if (categoryFilter) {
      result = result.filter(store => store.category === categoryFilter);
    }

    result.sort((a, b) => {
      const distA = parseFloat(a.distance?.replace(/[^0-9.]/g, '') || '999');
      const distB = parseFloat(b.distance?.replace(/[^0-9.]/g, '') || '999');
      return distA - distB;
    });

    return result;
  }, [stores, searchQuery, selectedCategory, language]);

  const categories = CATEGORIES[language];

  if (loading && locationLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('common.loading')}</p>
        <p className="text-xs text-muted-foreground">{t('location.searching')}</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* 위치 상태 표시 */}
          <LocationStatus 
            onLocationUpdate={handleLocationUpdate}
            showRefresh={true}
            compact={false}
          />

          <Input
            placeholder={t('stores.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm sm:text-base"
          />

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap text-xs sm:text-sm touch-manipulation"
                onClick={() => setSelectedCategory(category as CategoryType)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex-1 text-xs sm:text-sm"
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {t('stores.listView')}
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="flex-1 text-xs sm:text-sm"
            >
              <Map className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {t('stores.mapView')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {viewMode === 'list' ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredStores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  {searchQuery || selectedCategory !== (language === 'ko' ? '전체' : 'All')
                    ? t('stores.noResults')
                    : t('stores.noStores')}
                </p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))
            )}
          </div>
        ) : (
          <StoreMapView 
            stores={filteredStores} 
            userLocation={userLocation}
            isLocationAvailable={!!(latitude && longitude)}
          />
        )}
      </div>
    </div>
  );
}
