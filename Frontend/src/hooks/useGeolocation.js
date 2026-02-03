// src/hooks/useGeolocation.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    coordinates: null,
    address: null,
    accuracy: null,
    timestamp: null,
    isLoading: false,  // ✅ Changed to false - Don't auto-load
    error: null,
    permission: 'prompt'
  });

  const watchIdRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // ✅ FIX: Wrap defaultOptions in useMemo to prevent recreation
  const defaultOptions = useMemo(() => ({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  }), [options]);

  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
        permission: 'denied'
      }));
      return null;
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          const newLocation = {
            coordinates: { lat: latitude, lng: longitude },
            address: null,
            accuracy,
            timestamp: position.timestamp,
            isLoading: false,
            error: null,
            permission: 'granted'
          };

          setLocation(newLocation);
          resolve(newLocation);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          let permission = 'denied';

          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please enable location services.';
            permission = 'denied';
          } else if (error.code === 2) {
            errorMessage = 'Location information is unavailable.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
          }

          setLocation(prev => ({
            ...prev,
            error: errorMessage,
            isLoading: false,
            permission
          }));
          
          resolve(null);
        },
        defaultOptions
      );
    });
  }, [defaultOptions]);

  const watchPosition = useCallback((callback) => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return null;
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        const newLocation = {
          coordinates: { lat: latitude, lng: longitude },
          address: null,
          accuracy,
          timestamp: position.timestamp,
          isLoading: false,
          error: null,
          permission: 'granted'
        };

        setLocation(newLocation);
        
        if (callback) {
          callback(newLocation);
        }
      },
      (error) => {
        let errorMessage = 'Location tracking error';
        
        if (error.code === 1) {
          errorMessage = 'Location permission denied';
          setLocation(prev => ({ ...prev, permission: 'denied' }));
        } else if (error.code === 2) {
          errorMessage = 'Location unavailable';
        } else if (error.code === 3) {
          errorMessage = 'Location tracking timeout';
        }
        
        setLocation(prev => ({ ...prev, error: errorMessage }));
      },
      defaultOptions
    );

    return watchIdRef.current;
  }, [defaultOptions]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const calculateETA = useCallback((distanceKm, averageSpeedKmh = 30) => {
    if (!distanceKm || distanceKm <= 0) return 0;
    return (distanceKm / averageSpeedKmh) * 60;
  }, []);

  const formatForAPI = useCallback(() => {
    if (!location.coordinates) return null;

    return {
      coordinates: location.coordinates,
      address: location.address?.formatted || null,
      accuracy: location.accuracy,
      timestamp: location.timestamp
    };
  }, [location.coordinates, location.address, location.accuracy, location.timestamp]);

  // ✅ FIX: Don't auto-initialize geolocation on mount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    location: location.coordinates,
    address: location.address,
    accuracy: location.accuracy,
    isLoading: location.isLoading,
    error: location.error,
    permission: location.permission,
    getCurrentPosition,
    watchPosition,
    stopWatching,
    calculateDistance,
    calculateETA,
    formatForAPI,
    state: location
  };
};

export default useGeolocation;