
'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Clock, ChevronRight, Navigation, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store } from '@/lib/consumer-types';
import { useGeolocation } from '@/hooks/useGeolocation';

interface StoreCardProps {
  store: Store;
  showQuickActions?: boolean;
}

// Google Maps helper
// YouTube/Vimeo URL을 embed URL로 변환
const getEmbedUrl = (url: string): string => {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&mute=1`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0&muted=1`;
  }
  return url;
};

const openGoogleMapsDirections = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=transit`;
  
  if (isIOS) {
    const googleMapsUrl = `comgooglemaps://?saddr=${originStr}&daddr=${destStr}&directionsmode=transit`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = googleMapsUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
      window.open(webUrl, '_blank');
    }, 500);
  } else if (isAndroid) {
    try {
      window.location.href = `intent://maps.google.com/maps?saddr=${originStr}&daddr=${destStr}&dirflg=r#Intent;scheme=https;package=com.google.android.apps.maps;end`;
    } catch {
      window.open(webUrl, '_blank');
    }
  } else {
    window.open(webUrl, '_blank');
  }
};

export default function StoreCard({ store, showQuickActions = true }: StoreCardProps) {
  const router = useRouter();
  const { latitude, longitude } = useGeolocation();

  const userLocation = {
    lat: latitude ?? 37.5665,
    lng: longitude ?? 126.9780,
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    openGoogleMapsDirections(
      userLocation,
      { lat: store.latitude, lng: store.longitude }
    );
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/consumer/stores/${store.id}`)}
    >
      <CardContent className="p-0">
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0 relative">
            {/* 홍보 영상이 있으면 영상, 없으면 이미지 표시 */}
            {store.promo_video_url ? (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <iframe
                  src={getEmbedUrl(store.promo_video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={store.name}
                />
              </div>
            ) : (
              <img
                src={store.hero_image_url || store.thumbnailUrl}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 py-3 pr-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{store.name}</h3>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {store.category}
                </Badge>
              </div>
              {store.distance && (
                <span className="text-xs text-muted-foreground ml-2">
                  {store.distance}
                </span>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{store.locationText}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{store.openHours}</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            {showQuickActions && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={handleDirections}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  길찾기
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center pr-3">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
