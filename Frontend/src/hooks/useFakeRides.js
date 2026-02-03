// src/hooks/useFakeRides.js
import { useState, useCallback, useRef, useEffect } from 'react';

const RIDER_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];

const PICKUP_LOCATIONS = [
  { address: '123 Main St, Downtown', lat: 40.7505, lng: -73.9972 },
  { address: '456 Oak Ave, Brooklyn', lat: 40.6501, lng: -73.9496 },
  { address: '789 Pine Rd, Queens', lat: 40.7282, lng: -73.7949 },
  { address: '321 Elm St, Manhattan', lat: 40.7614, lng: -73.9776 },
  { address: '654 Maple Dr, Bronx', lat: 40.8448, lng: -73.8648 },
];

const DROPOFF_LOCATIONS = [
  { address: 'JFK Airport', lat: 40.6413, lng: -73.7781 },
  { address: 'Grand Central', lat: 40.7527, lng: -73.9772 },
  { address: 'Times Square', lat: 40.7580, lng: -73.9855 },
  { address: 'Central Park', lat: 40.7829, lng: -73.9654 },
  { address: 'Brooklyn Bridge', lat: 40.7014, lng: -73.9934 },
];

export const useFakeRides = () => {
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [popupRide, setPopupRide] = useState(null);
  const [popupAccepted, setPopupAccepted] = useState(false);
  const generationIntervalRef = useRef(null);
  const isOnlineRef = useRef(false);

  // Generate a single fake ride
  const generateFakeRide = useCallback(() => {
    const riderName = RIDER_NAMES[Math.floor(Math.random() * RIDER_NAMES.length)];
    const pickupLoc = PICKUP_LOCATIONS[Math.floor(Math.random() * PICKUP_LOCATIONS.length)];
    const dropoffLoc = DROPOFF_LOCATIONS[Math.floor(Math.random() * DROPOFF_LOCATIONS.length)];
    
    const distance = Math.random() * 15 + 2;
    const fare = (12 + Math.random() * 20).toFixed(2);
    const estimatedDuration = Math.floor(distance / 0.5);
    const rating = (3.5 + Math.random() * 1.5).toFixed(1);

    return {
      id: `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rider: {
        name: riderName,
        phone: `+1-555-${Math.floor(Math.random() * 9000 + 1000)}`,
        rating: rating + '★'
      },
      pickupLocation: {
        address: pickupLoc.address,
        coordinates: { lat: pickupLoc.lat + (Math.random() - 0.5) * 0.05, lng: pickupLoc.lng + (Math.random() - 0.5) * 0.05 }
      },
      dropoffLocation: {
        address: dropoffLoc.address,
        coordinates: { lat: dropoffLoc.lat, lng: dropoffLoc.lng }
      },
      fare: { total: fare, baseFare: '2.50', distanceFare: (distance * 1.5).toFixed(2) },
      distance: distance.toFixed(1),
      estimatedDuration,
      rideType: ['Standard', 'Comfort', 'Premium'][Math.floor(Math.random() * 3)],
      status: 'requested',
      createdAt: Date.now()
    };
  }, []);

  // Add new ride to upcoming list and show popup
  const addNewRide = useCallback(() => {
    if (!isOnlineRef.current) return;

    const newRide = generateFakeRide();
    setUpcomingRides(prev => [newRide, ...prev]);
    setPopupRide(newRide);
    setPopupAccepted(false);
  }, [generateFakeRide]);

  // Accept ride
  const acceptRide = useCallback((rideId) => {
    setUpcomingRides(prev => prev.filter(r => r.id !== rideId));
    
    const acceptedRide = upcomingRides.find(r => r.id === rideId);
    if (acceptedRide) {
      setCurrentRide({ ...acceptedRide, status: 'accepted', acceptedAt: Date.now() });
    }

    if (popupRide?.id === rideId) {
      setPopupAccepted(true);
    }
  }, [upcomingRides, popupRide]);

  // Decline ride
  const declineRide = useCallback((rideId) => {
    setUpcomingRides(prev => prev.filter(r => r.id !== rideId));

    if (popupRide?.id === rideId) {
      setPopupRide(null);
      setPopupAccepted(false);
    }
  }, [popupRide]);

  // Close popup
  const closePopup = useCallback(() => {
    setPopupRide(null);
    setPopupAccepted(false);
  }, []);

  // Toggle online status
  const setOnline = useCallback((isOnline) => {
    isOnlineRef.current = isOnline;

    if (isOnline) {
      // Generate first ride
      addNewRide();

      // Generate rides every 30-60 seconds
      generationIntervalRef.current = setInterval(() => {
        if (isOnlineRef.current) {
          addNewRide();
        }
      }, 30000 + Math.random() * 30000);
    } else {
      // Stop generating rides
      if (generationIntervalRef.current) {
        clearInterval(generationIntervalRef.current);
      }
      setUpcomingRides([]);
      setCurrentRide(null);
      setPopupRide(null);
    }
  }, [addNewRide]);

  // Complete current ride
  const completeRide = useCallback(() => {
    setCurrentRide(null);
    setPopupRide(null);
    setPopupAccepted(false);
  }, []);

  // Cancel current ride
  const cancelRide = useCallback(() => {
    setCurrentRide(null);
    setPopupRide(null);
    setPopupAccepted(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (generationIntervalRef.current) {
        clearInterval(generationIntervalRef.current);
      }
    };
  }, []);

  return {
    upcomingRides,
    currentRide,
    popupRide,
    popupAccepted,
    acceptRide,
    declineRide,
    closePopup,
    setOnline,
    completeRide,
    cancelRide,
    addNewRide
  };
};

export default useFakeRides;