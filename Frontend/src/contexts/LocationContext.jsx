// src/contexts/LocationContext.jsx
import React, { createContext, useState, useCallback } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [searchRadius, setSearchRadius] = useState(10);

  const updateLocation = useCallback((location) => {
    setUserLocation(location);
  }, []);

  const updateNearbyDrivers = useCallback((drivers) => {
    setNearbyDrivers(drivers);
  }, []);

  const value = {
    userLocation,
    nearbyDrivers,
    searchRadius,
    updateLocation,
    updateNearbyDrivers,
    setSearchRadius
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;