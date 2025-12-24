
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Ticket,
  ArrowLeft,
  Navigation,
  Share2,
  Heart,
  Camera,
  Map,
  ExternalLink,
  Car,
  Footprints,
  Train,
  Globe,
  ShoppingCart,
  CalendarCheck,
  Play,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/I18nContext';
import { storeService } from '@/lib/store-service';
import { Store } from '@/lib/consumer-types';
import { useGeolocation } from '@/hooks/useGeolocation';

// Google Maps Service
const googleMapsService = {
  openDirections: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'transit'
  ) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${destination.lat},${destination.lng}`;
    
    if (isIOS) {
      const googleMapsUrl = `comgooglemaps://?saddr=${originStr}&daddr=${destStr}&directionsmode=${travelMode}`;
      const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${travelMode}`;
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = googleMapsUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      }, 500);
    } else if (isAndroid) {
      const intentUrl = `intent://maps.google.com/maps?saddr=${originStr}&daddr=${destStr}&dirflg=${travelMode === 'driving' ? 'd' : travelMode === 'walking' ? 'w' : 'r'}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
      const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${travelMode}`;
      
      try {
        window.location.href = intentUrl;
      } catch {
        window.open(webUrl, '_blank');
      }
    } else {
      const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${travelMode}`;
      window.open(webUrl, '_blank');
    }
  },

  openLocation: (lat: number, lng: number, label?: string) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
    
    if (isIOS) {
      const googleMapsUrl = `comgooglemaps://?q=${query}&center=${lat},${lng}&zoom=17`;
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = googleMapsUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      }, 500);
    } else if (isAndroid) {
      const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label || 'Location'})`;
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      
      try {
        window.location.href = geoUrl;
      } catch {
        window.open(webUrl, '_blank');
      }
    } else {
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(webUrl, '_blank');
    }
  },

  openStreetView: (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    window.open(url, '_blank');
  },
};

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useI18n();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'transit'>('transit');

  // Get user location
  const { latitude, longitude } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
  });

  const userLocation = {
    lat: latitude ?? 37.5665,
    lng: longitude ?? 126.9780,
  };

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await storeService.getStoreById(params?.id as string);
        setStore(data);
      } catch (error) {
        console.error('Failed to fetch store:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchStore();
    }
  }, [params?.id]);

  // Handle directions with Google Maps
  const handleDirections = useCallback(() => {
    if (!store) return;
    
    googleMapsService.openDirections(
      userLocation,
      { lat: store.latitude, lng: store.longitude },
      travelMode
    );
  }, [store, userLocation, travelMode]);

  // Handle view on Google Maps
  const handleViewOnMap = useCallback(() => {
    if (!store) return;
    googleMapsService.openLocation(store.latitude, store.longitude, store.name);
  }, [store]);

  // Handle Street View
  const handleStreetView = useCallback(() => {
    if (!store) return;
    googleMapsService.openStreetView(store.latitude, store.longitude);
  }, [store]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!store) return;
    
    const shareData = {
      title: store.name,
      text: `${store.name} - ${store.locationText}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'ko' ? '링크가 복사되었습니다!' : 'Link copied!');
    }
  }, [store, language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground mb-4">
          {language === 'ko' ? '매장을 찾을 수 없습니다' : 'Store not found'}
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'ko' ? '돌아가기' : 'Go Back'}
        </Button>
      </div>
    );
  }

  const mainImageUrl = store?.hero_image_url || store?.thumbnailUrl;

  // YouTube/Vimeo URL을 embed URL로 변환
  const getEmbedUrl = (url: string): string => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-primary/20 to-primary/5">
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt={store?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        {/* Store Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-2">{store?.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{store?.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">4.5</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {store?.description}
              </p>

              <div className="space-y-3">
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
                  onClick={handleViewOnMap}
                >
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm underline">{store?.locationText}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{store?.openHours ?? '09:00 - 22:00'}</span>
                </div>
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => window.open(`tel:${store?.contact}`, '_self')}
                >
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm underline">{store?.contact ?? '02-1234-5678'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {store?.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Google Maps Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4"
        >
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-500" />
                {language === 'ko' ? 'Google 지도로 길찾기' : 'Get Directions with Google Maps'}
              </h2>

              {/* Travel Mode Selection */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={travelMode === 'transit' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTravelMode('transit')}
                >
                  <Train className="w-4 h-4 mr-1" />
                  {language === 'ko' ? '대중교통' : 'Transit'}
                </Button>
                <Button
                  variant={travelMode === 'driving' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTravelMode('driving')}
                >
                  <Car className="w-4 h-4 mr-1" />
                  {language === 'ko' ? '자동차' : 'Driving'}
                </Button>
                <Button
                  variant={travelMode === 'walking' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTravelMode('walking')}
                >
                  <Footprints className="w-4 h-4 mr-1" />
                  {language === 'ko' ? '도보' : 'Walking'}
                </Button>
              </div>

              {/* Main Directions Button */}
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                size="lg"
                onClick={handleDirections}
              >
                <Navigation className="w-5 h-5 mr-2" />
                {language === 'ko' ? 'Google 지도 앱에서 길찾기' : 'Open in Google Maps App'}
              </Button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={handleViewOnMap}>
                  <MapPin className="w-4 h-4 mr-1" />
                  {language === 'ko' ? '지도에서 보기' : 'View on Map'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleStreetView}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {language === 'ko' ? '스트리트 뷰' : 'Street View'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AR Fitting & Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 grid grid-cols-2 gap-3"
        >
          <Button 
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            onClick={() => router.push(`/consumer/ar/${store?.id}`)}
          >
            <Camera className="w-4 h-4 mr-2" />
            {language === 'ko' ? 'AR 피팅' : 'AR Fitting'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open(`tel:${store?.contact}`, '_self')}
          >
            <Phone className="w-4 h-4 mr-2" />
            {language === 'ko' ? '전화하기' : 'Call'}
          </Button>
        </motion.div>

        {/* External Links Section - 홈페이지, 구매, 예약 */}
        {(store?.homepage_url || store?.order_url || store?.reservation_url || (store?.store_links && store.store_links.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4"
          >
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              {language === 'ko' ? '바로가기' : 'Quick Links'}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {store?.homepage_url && (
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3"
                  onClick={() => window.open(store.homepage_url!, '_blank')}
                >
                  <Globe className="w-5 h-5 mb-1" />
                  <span className="text-xs">{language === 'ko' ? '홈페이지' : 'Website'}</span>
                </Button>
              )}
              {store?.order_url && (
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3"
                  onClick={() => window.open(store.order_url!, '_blank')}
                >
                  <ShoppingCart className="w-5 h-5 mb-1" />
                  <span className="text-xs">{language === 'ko' ? '구매하기' : 'Order'}</span>
                </Button>
              )}
              {store?.reservation_url && (
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3"
                  onClick={() => window.open(store.reservation_url!, '_blank')}
                >
                  <CalendarCheck className="w-5 h-5 mb-1" />
                  <span className="text-xs">{language === 'ko' ? '예약하기' : 'Reserve'}</span>
                </Button>
              )}
              {/* 추가 링크들 */}
              {store?.store_links?.map((link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  className="flex-col h-auto py-3"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <ExternalLink className="w-5 h-5 mb-1" />
                  <span className="text-xs truncate w-full text-center">{link.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Promo Video Section */}
        {store?.promo_video_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-4"
          >
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500" />
              {language === 'ko' ? '홍보 영상' : 'Promo Video'}
            </h2>
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-lg">
                <div className="aspect-video">
                  <iframe
                    src={getEmbedUrl(store.promo_video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${store.name} 홍보 영상`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Gallery Section */}
        {store?.store_media && store.store_media.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-500" />
              {language === 'ko' ? '갤러리' : 'Gallery'}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {store.store_media.map((media) => (
                <div key={media.id} className="aspect-square rounded-lg overflow-hidden">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.title || store.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(media.url, '_blank')}
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <iframe
                        src={getEmbedUrl(media.url)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Coupons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6"
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            {language === 'ko' ? '사용 가능한 쿠폰' : 'Available Coupons'}
          </h2>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-sm">
                {language === 'ko' ? '현재 사용 가능한 쿠폰이 없습니다' : 'No coupons available'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
