
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean; // 실시간 위치 추적 여부
}

const LOCATION_CACHE_KEY = 'airctt_last_location';
const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5분

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: true,
  });

  const watchIdRef = useRef<number | null>(null);

  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 60000,
    watch = false,
  } = options;

  // 캐시된 위치 불러오기
  const loadCachedLocation = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (cached) {
        const { latitude, longitude, accuracy, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // 캐시가 유효한 경우
        if (age < LOCATION_CACHE_DURATION) {
          return { latitude, longitude, accuracy, timestamp };
        }
      }
    } catch {
      // 캐시 로드 실패 무시
    }
    return null;
  }, []);

  // 위치 캐시 저장
  const saveLocationCache = useCallback((coords: GeolocationCoordinates) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp: Date.now(),
      }));
    } catch {
      // 캐시 저장 실패 무시
    }
  }, []);

  // 위치 성공 핸들러
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const { coords, timestamp } = position;
    
    setState({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed,
      timestamp,
      error: null,
      loading: false,
    });

    // 위치 캐시 저장
    saveLocationCache(coords);
  }, [saveLocationCache]);

  // 위치 에러 핸들러
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = '위치를 가져올 수 없습니다.';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = '위치 정보를 사용할 수 없습니다. GPS 신호를 확인해주세요.';
        break;
      case error.TIMEOUT:
        errorMessage = '위치 요청 시간이 초과되었습니다. 다시 시도해주세요.';
        break;
    }

    // 캐시된 위치가 있으면 사용
    const cached = loadCachedLocation();
    if (cached) {
      setState(prev => ({
        ...prev,
        latitude: cached.latitude,
        longitude: cached.longitude,
        accuracy: cached.accuracy,
        timestamp: cached.timestamp,
        error: `${errorMessage} (캐시된 위치 사용 중)`,
        loading: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  }, [loadCachedLocation]);

  // 현재 위치 가져오기
  const getCurrentPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: '이 브라우저에서는 위치 서비스를 지원하지 않습니다.',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // 먼저 캐시된 위치 표시 (빠른 응답)
    const cached = loadCachedLocation();
    if (cached) {
      setState(prev => ({
        ...prev,
        latitude: cached.latitude,
        longitude: cached.longitude,
        accuracy: cached.accuracy,
        timestamp: cached.timestamp,
      }));
    }

    // 실제 위치 요청
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, loadCachedLocation]);

  // 위치 추적 시작
  const startWatching = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge: 0, // 실시간 추적 시 캐시 사용 안함
      }
    );
  }, [enableHighAccuracy, timeout, handleSuccess, handleError]);

  // 위치 추적 중지
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // 초기 위치 가져오기
  useEffect(() => {
    getCurrentPosition();

    if (watch) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, [getCurrentPosition, watch, startWatching, stopWatching]);

  // 새로고침 함수
  const refresh = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return {
    ...state,
    refresh,
    startWatching,
    stopWatching,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  };
}

// 두 좌표 간 거리 계산 (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// 거리 포맷팅
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}
