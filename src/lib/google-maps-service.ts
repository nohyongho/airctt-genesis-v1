
/**
 * Google Maps Service
 * Provides utilities for integrating with Google Maps app on mobile devices
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

/**
 * Detect the current platform
 */
export const detectPlatform = (): 'ios' | 'android' | 'desktop' => {
  if (typeof navigator === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent;
  
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'ios';
  }
  if (/Android/.test(userAgent)) {
    return 'android';
  }
  return 'desktop';
};

/**
 * Open Google Maps app with directions
 */
export const openDirections = (
  origin: Coordinates,
  destination: Coordinates,
  travelMode: TravelMode = 'transit'
): void => {
  const platform = detectPlatform();
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  
  const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${travelMode}`;
  
  switch (platform) {
    case 'ios':
      // Try Google Maps app first, then fallback to web
      const googleMapsUrl = `comgooglemaps://?saddr=${originStr}&daddr=${destStr}&directionsmode=${travelMode}`;
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = googleMapsUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      }, 500);
      break;
      
    case 'android':
      // Use Android intent for Google Maps
      const dirFlag = travelMode === 'driving' ? 'd' : travelMode === 'walking' ? 'w' : 'r';
      const intentUrl = `intent://maps.google.com/maps?saddr=${originStr}&daddr=${destStr}&dirflg=${dirFlag}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
      
      try {
        window.location.href = intentUrl;
      } catch {
        window.open(webUrl, '_blank');
      }
      break;
      
    default:
      window.open(webUrl, '_blank');
  }
};

/**
 * Open Google Maps app to view a specific location
 */
export const openLocation = (
  coordinates: Coordinates,
  label?: string
): void => {
  const platform = detectPlatform();
  const { lat, lng } = coordinates;
  const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
  
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  
  switch (platform) {
    case 'ios':
      const googleMapsUrl = `comgooglemaps://?q=${query}&center=${lat},${lng}&zoom=17`;
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = googleMapsUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      }, 500);
      break;
      
    case 'android':
      const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label || 'Location'})`;
      
      try {
        window.location.href = geoUrl;
      } catch {
        window.open(webUrl, '_blank');
      }
      break;
      
    default:
      window.open(webUrl, '_blank');
  }
};

/**
 * Open Google Maps Street View
 */
export const openStreetView = (coordinates: Coordinates): void => {
  const { lat, lng } = coordinates;
  const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
  window.open(url, '_blank');
};

/**
 * Open Google Maps with a search query
 */
export const searchNearby = (
  coordinates: Coordinates,
  query: string
): void => {
  const { lat, lng } = coordinates;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.google.com/maps/search/${encodedQuery}/@${lat},${lng},15z`;
  window.open(url, '_blank');
};

/**
 * Generate a static map image URL (for preview purposes)
 */
export const getStaticMapUrl = (
  coordinates: Coordinates,
  options: {
    width?: number;
    height?: number;
    zoom?: number;
    markers?: boolean;
  } = {}
): string => {
  const { lat, lng } = coordinates;
  const { width = 400, height = 300, zoom = 15, markers = true } = options;
  
  // Note: This requires a Google Maps API key for production use
  // For now, return a placeholder or use OpenStreetMap
  const markerParam = markers ? `&markers=color:red%7C${lat},${lng}` : '';
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}${markerParam}&key=YOUR_API_KEY`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

/**
 * Format distance for display
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

/**
 * Google Maps Service object for easy import
 */
export const googleMapsService = {
  detectPlatform,
  openDirections,
  openLocation,
  openStreetView,
  searchNearby,
  getStaticMapUrl,
  calculateDistance,
  formatDistance,
};

export default googleMapsService;
