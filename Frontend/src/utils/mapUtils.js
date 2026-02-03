// src/utils/mapUtils.js

/**
 * Calculate bearing between two points
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

/**
 * Calculate speed in km/h
 */
export const calculateSpeed = (distance, timeDiff) => {
  if (timeDiff <= 0) return 0;
  const hours = timeDiff / (1000 * 3600);
  return distance / hours;
};

/**
 * Format distance for display
 */
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

/**
 * Format time for display
 */
export const formatTime = (minutes) => {
  if (minutes < 1) {
    return '< 1 min';
  }
  return `${Math.round(minutes)} min`;
};

/**
 * Format speed for display
 */
export const formatSpeed = (kmh) => {
  return `${Math.round(kmh)} km/h`;
};

/**
 * Get map bounds from coordinates
 */
export const getMapBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;

  let minLat = coordinates[0][0];
  let maxLat = coordinates[0][0];
  let minLng = coordinates[0][1];
  let maxLng = coordinates[0][1];

  coordinates.forEach(([lat, lng]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  return [[minLat, minLng], [maxLat, maxLng]];
};

/**
 * Check if location is valid
 */
export const isValidLocation = (location) => {
  return (
    location &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    location.lat >= -90 &&
    location.lat <= 90 &&
    location.lng >= -180 &&
    location.lng <= 180
  );
};

/**
 * Get map zoom level based on distance
 */
export const getZoomLevel = (distance) => {
  if (distance < 1) return 18;
  if (distance < 5) return 15;
  if (distance < 10) return 14;
  if (distance < 30) return 13;
  return 12;
};

export default {
  calculateBearing,
  calculateSpeed,
  formatDistance,
  formatTime,
  formatSpeed,
  getMapBounds,
  isValidLocation,
  getZoomLevel
};