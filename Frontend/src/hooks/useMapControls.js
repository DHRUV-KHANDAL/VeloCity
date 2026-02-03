// src/hooks/useMapControls.js
import { useState, useCallback, useRef } from 'react';

const useMapControls = (initialZoom = 14, initialCenter = null) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [center, setCenter] = useState(initialCenter || { lat: 40.7128, lng: -74.0060 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const mapRef = useRef(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 1, 20));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 1, 1));
  }, []);

  const handleCenter = useCallback(() => {
    console.log('Centering map at:', center);
    if (mapRef.current) {
      // Trigger map re-center if using Leaflet or Google Maps
      mapRef.current.setView?.([center.lat, center.lng], zoom);
    }
  }, [center, zoom]);

  const handleReset = useCallback(() => {
    setZoom(initialZoom);
    setCenter(initialCenter || { lat: 40.7128, lng: -74.0060 });
    setIsFullscreen(false);
  }, [initialZoom, initialCenter]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleCall = useCallback((phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      console.log('No phone number provided');
    }
  }, []);

  const handleMessage = useCallback((phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `sms:${phoneNumber}`;
    } else {
      console.log('No phone number provided');
    }
  }, []);

  const handleEmergency = useCallback(() => {
    console.log('Emergency alert triggered');
    // Trigger emergency services
    window.location.href = 'tel:911';
  }, []);

  return {
    zoom,
    center,
    setZoom,
    setCenter,
    isFullscreen,
    showControls,
    mapRef,
    handleZoomIn,
    handleZoomOut,
    handleCenter,
    handleReset,
    handleFullscreen,
    handleCall,
    handleMessage,
    handleEmergency,
  };
};

export default useMapControls;