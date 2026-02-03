// src/hooks/useMapTracking.js
import { useState, useCallback, useEffect, useRef } from 'react';
import useGeolocation from './useGeolocation';

const useMapTracking = () => {
  const [trackingData, setTrackingData] = useState({
    distance: null,
    eta: null,
    bearing: null,
    speed: null,
    lastUpdate: null
  });

  const previousLocationRef = useRef(null);
  const { calculateDistance, calculateETA } = useGeolocation();

  const calculateBearing = useCallback((lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
      Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    return Math.atan2(y, x) * 180 / Math.PI;
  }, []);

  const calculateSpeed = useCallback((lat1, lon1, lat2, lon2, timeDiff) => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    const hours = (timeDiff / 1000) / 3600;
    return hours > 0 ? distance / hours : 0;
  }, [calculateDistance]);

  const updateTracking = useCallback((currentLocation, destination) => {
    if (!currentLocation || !destination) return;

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.lat,
      destination.lng
    );

    const eta = calculateETA(distance);

    let bearing = null;
    let speed = null;

    if (previousLocationRef.current) {
      const timeDiff = currentLocation.timestamp - previousLocationRef.current.timestamp;
      bearing = calculateBearing(
        previousLocationRef.current.lat,
        previousLocationRef.current.lng,
        currentLocation.lat,
        currentLocation.lng
      );
      speed = calculateSpeed(
        previousLocationRef.current.lat,
        previousLocationRef.current.lng,
        currentLocation.lat,
        currentLocation.lng,
        timeDiff
      );
    }

    previousLocationRef.current = currentLocation;

    setTrackingData({
      distance: parseFloat(distance.toFixed(2)),
      eta: Math.round(eta),
      bearing: bearing ? parseFloat(bearing.toFixed(2)) : null,
      speed: speed ? parseFloat(speed.toFixed(2)) : null,
      lastUpdate: new Date()
    });
  }, [calculateDistance, calculateETA, calculateBearing, calculateSpeed]);

  const reset = useCallback(() => {
    setTrackingData({
      distance: null,
      eta: null,
      bearing: null,
      speed: null,
      lastUpdate: null
    });
    previousLocationRef.current = null;
  }, []);

  return {
    trackingData,
    updateTracking,
    reset
  };
};

export default useMapTracking;