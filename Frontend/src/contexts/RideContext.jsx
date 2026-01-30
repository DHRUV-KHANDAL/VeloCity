// src/contexts/RideContext.jsx
import React, { createContext, useState, useCallback } from 'react';

export const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [currentRide, setCurrentRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [availableRides, setAvailableRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);

  const setRide = useCallback((ride) => {
    setCurrentRide(ride);
    if (ride) {
      setAvailableRides([]);
    }
  }, []);

  const updateRideStatus = useCallback((rideId, status) => {
    if (currentRide && currentRide._id === rideId) {
      setCurrentRide(prev => ({ ...prev, status }));
    }
  }, [currentRide]);

  const addToHistory = useCallback((ride) => {
    setRideHistory(prev => [ride, ...prev]);
  }, []);

  const clearCurrentRide = useCallback(() => {
    setCurrentRide(null);
  }, []);

  const value = {
    currentRide,
    rideHistory,
    availableRides,
    selectedRide,
    setRide,
    setAvailableRides,
    setSelectedRide,
    updateRideStatus,
    addToHistory,
    clearCurrentRide
  };

  return (
    <RideContext.Provider value={value}>
      {children}
    </RideContext.Provider>
  );
};

export default RideContext;