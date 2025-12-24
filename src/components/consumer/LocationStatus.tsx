
'use client';

import { motion } from 'framer-motion';
import { MapPin, RefreshCw, AlertCircle, CheckCircle2, Navigation, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useI18n } from '@/contexts/I18nContext';
import { useEffect } from 'react';

interface LocationStatusProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
  showRefresh?: boolean;
  compact?: boolean;
}

export default function LocationStatus({ 
  onLocationUpdate, 
  showRefresh = true,
  compact = false 
}: LocationStatusProps) {
  const { latitude, longitude, accuracy, loading, error, refresh, isSupported } = useGeolocation();
  const { t, language } = useI18n();

  // 위치가 업데이트되면 콜백 호출
  useEffect(() => {
    if (latitude && longitude && onLocationUpdate) {
      onLocationUpdate(latitude, longitude);
    }
  }, [latitude, longitude, onLocationUpdate]);

  const handleRefresh = () => {
    refresh();
  };

  // 정확도 표시 포맷
  const formatAccuracy = (acc: number | null) => {
    if (!acc) return '';
    if (acc < 50) return language === 'ko' ? '매우 정확' : 'Very accurate';
    if (acc < 100) return language === 'ko' ? '정확' : 'Accurate';
    if (acc < 500) return language === 'ko' ? '보통' : 'Moderate';
    return language === 'ko' ? '대략적' : 'Approximate';
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        {loading ? (
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-xs">{t('location.searching')}</span>
          </Badge>
        ) : error ? (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            <span className="text-xs">{language === 'ko' ? '위치 오류' : 'Location Error'}</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">{language === 'ko' ? '위치 확인됨' : 'Location Found'}</span>
          </Badge>
        )}
        {showRefresh && !loading && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`overflow-hidden ${
        loading 
          ? 'border-yellow-500/30 bg-yellow-500/5' 
          : error 
            ? 'border-red-500/30 bg-red-500/5' 
            : 'border-green-500/30 bg-green-500/5'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 상태 아이콘 */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                loading 
                  ? 'bg-yellow-500/20' 
                  : error 
                    ? 'bg-red-500/20' 
                    : 'bg-green-500/20'
              }`}>
                {loading ? (
                  <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin" />
                ) : error ? (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <Navigation className="w-6 h-6 text-green-500" />
                )}
              </div>

              {/* 상태 텍스트 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">
                    {loading 
                      ? t('location.searching')
                      : error 
                        ? t('location.error')
                        : t('location.found')
                    }
                  </p>
                  {!loading && !error && (
                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                      <Smartphone className="w-2.5 h-2.5 mr-1" />
                      {language === 'ko' ? '기기 연동' : 'Device Synced'}
                    </Badge>
                  )}
                </div>

                {!loading && !error && latitude && longitude && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground font-mono">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                    {accuracy && (
                      <p className="text-[10px] text-muted-foreground">
                        {language === 'ko' ? '정확도' : 'Accuracy'}: {formatAccuracy(accuracy)} (±{Math.round(accuracy)}m)
                      </p>
                    )}
                  </div>
                )}

                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                {!isSupported && (
                  <p className="text-xs text-orange-500">
                    {language === 'ko' 
                      ? '이 브라우저에서는 위치 서비스를 지원하지 않습니다.' 
                      : 'Location services not supported in this browser.'}
                  </p>
                )}
              </div>
            </div>

            {/* 새로고침 버튼 */}
            {showRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {language === 'ko' ? '새로고침' : 'Refresh'}
                </span>
              </Button>
            )}
          </div>

          {/* 위치 권한 안내 (에러 시) */}
          {error && error.includes('권한') && (
            <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {language === 'ko' 
                  ? '📍 위치 권한을 허용하면 가까운 매장을 찾을 수 있습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
                  : '📍 Allow location permission to find nearby stores. Please enable location access in your browser settings.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
