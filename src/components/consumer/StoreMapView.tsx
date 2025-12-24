
'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink, Phone, Clock, Loader2, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store } from '@/lib/consumer-types';
import { useI18n } from '@/contexts/I18nContext';
import Link from 'next/link';

interface StoreMapViewProps {
  stores: Store[];
  userLocation: { lat: number; lng: number };
  isLocationAvailable?: boolean;
}

// Google Maps URL helper functions
const googleMapsService = {
  // Open Google Maps app for directions
  openDirections: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'transit'
  ) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${destination.lat},${destination.lng}`;
    
    // Try to open native Google Maps app first
    if (isIOS) {
      // iOS: Try Google Maps app, fallback to Apple Maps
      const googleMapsUrl = `comgooglemaps://?saddr=${originStr}&daddr=${destStr}&directionsmode=${travelMode}`;
      const appleMapsUrl = `maps://maps.apple.com/?saddr=${originStr}&daddr=${destStr}&dirflg=${travelMode === 'driving' ? 'd' : travelMode === 'walking' ? 'w' : 'r'}`;
      const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${travelMode}`;
      
      // Try Google Maps app first
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = googleMapsUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        // If Google Maps didn't open, try web version
        window.open(webUrl, '_blank');
      }, 500);
    } else if (isAndroid) {
      // Android: Use intent URL for Google Maps app
      const intentUrl = `intent://maps.google.com/maps?saddr=${originStr}&daddr=${destStr}&dirflg=${travelMode === 'driving' ? 'd' : travelMode === 'walking' ? 'w' : 'r'}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
      const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${travelMode}`;
      
      // Try intent first, fallback to web
      try {
        window.location.href = intentUrl;
      } catch {
        window.open(webUrl, '_blank');
      }
    } else {
      // Desktop: Open web version
      const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${travelMode}`;
      window.open(webUrl, '_blank');
    }
  },

  // Open Google Maps app to view a location
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

  // Open Google Maps app with Street View
  openStreetView: (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    window.open(url, '_blank');
  },
};

export default function StoreMapView({ stores, userLocation, isLocationAvailable = false }: StoreMapViewProps) {
  const { t, language } = useI18n();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'transit'>('transit');
  const mapRef = useRef<HTMLDivElement>(null);

  // Google Maps app directions
  const handleDirections = (store: Store) => {
    googleMapsService.openDirections(
      userLocation,
      { lat: store.latitude, lng: store.longitude },
      travelMode
    );
  };

  // Google Maps app location view
  const handleViewOnMap = (store: Store) => {
    googleMapsService.openLocation(store.latitude, store.longitude, store.name);
  };

  // Google Maps Street View
  const handleStreetView = (store: Store) => {
    googleMapsService.openStreetView(store.latitude, store.longitude);
  };

  return (
    <div className="space-y-4">
      {/* Map Area */}
      <Card className="h-[50vh] sm:h-[60vh] overflow-hidden">
        <CardContent className="p-0 h-full relative" ref={mapRef}>
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20">
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            />
            
            {/* User Location Marker */}
            {isLocationAvailable && (
              <div 
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: '50%', top: '50%' }}
              >
                <div className="relative">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                  <div className="absolute -inset-3 bg-blue-500/20 rounded-full animate-ping" />
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <Badge variant="secondary" className="text-xs shadow-md">
                    <Navigation className="w-3 h-3 mr-1" />
                    {language === 'ko' ? '내 위치' : 'My Location'}
                  </Badge>
                </div>
              </div>
            )}

            {/* Store Markers */}
            {stores.slice(0, 10).map((store, index) => {
              const offsetX = ((store.longitude - userLocation.lng) * 5000) % 40;
              const offsetY = ((store.latitude - userLocation.lat) * 5000) % 40;
              
              return (
                <div
                  key={store.id}
                  className={`absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-200 hover:scale-110 ${
                    selectedStore?.id === store.id ? 'scale-125 z-30' : ''
                  }`}
                  style={{
                    left: `${30 + (index * 7) + offsetX}%`,
                    top: `${25 + (index * 8) + offsetY}%`,
                  }}
                  onClick={() => setSelectedStore(store)}
                >
                  <div className={`relative ${selectedStore?.id === store.id ? 'animate-bounce' : ''}`}>
                    <MapPin 
                      className={`w-8 h-8 drop-shadow-lg ${
                        selectedStore?.id === store.id 
                          ? 'text-primary fill-primary/30' 
                          : 'text-red-500 fill-red-500/30'
                      }`} 
                    />
                    {store.distance && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] whitespace-nowrap shadow-md"
                      >
                        {store.distance}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bottom Info Card */}
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="bg-background/95 backdrop-blur">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {stores.length}{language === 'ko' ? '개 매장' : ' stores'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        googleMapsService.openLocation(userLocation.lat, userLocation.lng);
                      }}
                    >
                      <Map className="h-3 w-3 mr-1" />
                      {language === 'ko' ? 'Google 지도 열기' : 'Open Google Maps'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Store Info */}
      {selectedStore && (
        <Card className="border-primary/50 shadow-lg animate-in slide-in-from-bottom-4">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Store Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {selectedStore.thumbnailUrl ? (
                  <img
                    src={selectedStore.thumbnailUrl}
                    alt={selectedStore.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold truncate">{selectedStore.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedStore.category}</p>
                  </div>
                  {selectedStore.distance && (
                    <Badge variant="outline" className="flex-shrink-0">
                      {selectedStore.distance}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {selectedStore.locationText}
                </p>

                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{selectedStore.openHours}</span>
                </div>
              </div>
            </div>

            {/* Travel Mode Selection */}
            <div className="flex gap-2 mt-4 mb-3">
              <Badge 
                variant={travelMode === 'transit' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setTravelMode('transit')}
              >
                {language === 'ko' ? '대중교통' : 'Transit'}
              </Badge>
              <Badge 
                variant={travelMode === 'driving' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setTravelMode('driving')}
              >
                {language === 'ko' ? '자동차' : 'Driving'}
              </Badge>
              <Badge 
                variant={travelMode === 'walking' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setTravelMode('walking')}
              >
                {language === 'ko' ? '도보' : 'Walking'}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
                onClick={() => handleDirections(selectedStore)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {language === 'ko' ? 'Google 지도 길찾기' : 'Google Maps Directions'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleViewOnMap(selectedStore)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'ko' ? '지도에서 보기' : 'View on Map'}
              </Button>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => handleStreetView(selectedStore)}
              >
                {language === 'ko' ? '스트리트 뷰' : 'Street View'}
              </Button>
              <Link href={`/consumer/stores/${selectedStore.id}`} className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  {t('stores.viewDetail')}
                </Button>
              </Link>
            </div>

            {/* Phone Call */}
            {selectedStore.contact && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => window.open(`tel:${selectedStore.contact}`, '_self')}
              >
                <Phone className="h-4 w-4 mr-2" />
                {selectedStore.contact}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Store List (Scrollable) */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm px-1">
          {language === 'ko' ? '근처 매장 목록' : 'Nearby Stores'}
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {stores.map((store) => (
            <Card
              key={store.id}
              className={`flex-shrink-0 w-48 cursor-pointer transition-all hover:shadow-md ${
                selectedStore?.id === store.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedStore(store)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {store.thumbnailUrl ? (
                      <img
                        src={store.thumbnailUrl}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{store.name}</p>
                    <p className="text-xs text-muted-foreground">{store.distance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
