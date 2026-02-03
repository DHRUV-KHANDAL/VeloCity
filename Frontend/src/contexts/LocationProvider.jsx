// src/contexts/LocationProvider.jsx
import { useState, useCallback, createContext } from 'react';

export const LocationContext = createContext();

const LocationProvider = ({ children }) => {
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

export default LocationProvider;