
'use client';

import { MapPin } from 'lucide-react';

interface MapViewProps {
  lat: number;
  lng: number;
  provider?: 'kakao' | 'naver' | 'google';
  storeName?: string;
  height?: string;
}

export default function MapView({ lat, lng, provider = 'kakao', storeName, height = '240px' }: MapViewProps) {
  return (
    <div
      className="relative w-full bg-muted rounded-lg overflow-hidden border"
      style={{ height }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
        <MapPin className="h-12 w-12 text-primary" />
        <div className="space-y-1">
          {storeName && (
            <p className="font-semibold text-lg">{storeName}</p>
          )}
          <p className="text-sm text-muted-foreground">
            위도: {lat.toFixed(4)}, 경도: {lng.toFixed(4)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            지도 SDK 연동 예정 ({provider})
          </p>
        </div>
      </div>
    </div>
  );
}
