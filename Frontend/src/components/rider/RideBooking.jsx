// src/components/rider/RideBooking.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Clock, DollarSign, X, MessageSquare, Phone, Star, Navigation, AlertCircle, CheckCircle, Loader, ChevronDown } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';
import useWebSocket from '../../hooks/useWebSocket';
import useRide from '../../hooks/useRide';
import useAuth from '../../hooks/useAuth';

const RideBooking = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [rideType, setRideType] = useState('standard');
  const [currentRide, setCurrentRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();
  const { location: riderLocation, address, isLoading: locationLoading, getCurrentPosition, calculateDistance, calculateETA } = useGeolocation();
  const { sendMessage, lastMessage } = useWebSocket();
  const { bookRide, loading: rideLoading } = useRide();

  // Refs for avoiding dependencies
  const currentRideRef = useRef(null);
  const riderLocationRef = useRef(null);

  useEffect(() => {
    currentRideRef.current = currentRide;
  }, [currentRide]);

  useEffect(() => {
    riderLocationRef.current = riderLocation;
  }, [riderLocation]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    // ✅ FIX: Wrap each case in braces to allow declarations
    switch (message.type) {
      case 'ride_accepted': {
        const ride = message.data.ride;
        setCurrentRide(ride);
        setSuccess('Driver found! Heading to you...');
        setTimeout(() => setSuccess(''), 3000);
        break;
      }

      case 'driver_location_update': {
        if (currentRideRef.current && currentRideRef.current.driver?._id === message.data.driverId) {
          setDriverLocation(message.data.location);

          if (riderLocationRef.current && message.data.location) {
            const distance = calculateDistance(
              riderLocationRef.current.lat,
              riderLocationRef.current.lng,
              message.data.location.lat,
              message.data.location.lng
            );
            const eta = calculateETA(distance);
            console.log(`Driver ETA: ${Math.round(eta)} minutes`);
          }
        }
        break;
      }

      case 'ride_started': {
        const rideData = message.data.ride;
        setCurrentRide(rideData);
        setSuccess('Ride started!');
        setTimeout(() => setSuccess(''), 3000);
        break;
      }

      case 'ride_completed': {
        setCurrentRide(null);
        setDriverLocation(null);
        setSuccess('Ride completed! Thank you for using VeloCity.');
        setTimeout(() => setSuccess(''), 4000);
        break;
      }

      case 'ride_error': {
        const errorMsg = message.data.error || 'An error occurred';
        setError(errorMsg);
        setTimeout(() => setError(''), 4000);
        break;
      }

      default:
        break;
    }
  }, [calculateDistance, calculateETA]);

  // Use setTimeout to avoid setState in effect
  useEffect(() => {
    if (!lastMessage) return;

    const timer = setTimeout(() => {
      handleWebSocketMessage(lastMessage);
    }, 0);

    return () => clearTimeout(timer);
  }, [lastMessage, handleWebSocketMessage]);

  // One-click current location
  const handleUseCurrentLocation = async () => {
    const locationData = await getCurrentPosition();

    if (locationData) {
      setPickup(locationData.address?.formatted || 'Current Location');
    }
  };

  // Book a ride
  const handleBookRide = async () => {
    if (!pickup || !dropoff) {
      setError('Please enter both pickup and dropoff locations');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const rideData = {
      pickupLocation: { address: pickup },
      dropoffLocation: { address: dropoff },
      rideType
    };

    const result = await bookRide(rideData);

    if (result.success) {
      setCurrentRide(result.ride);
      setSuccess('Ride booked! Finding a driver...');
      setTimeout(() => setSuccess(''), 3000);

      sendMessage({
        type: 'ride_requested',
        rideId: result.ride._id,
        pickupLocation: rideData.pickupLocation
      });
    } else {
      setError(result.error || 'Failed to book ride');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Cancel ride
  const handleCancelRide = () => {
    if (currentRide) {
      sendMessage({
        type: 'ride_cancelled',
        rideId: currentRide._id
      });
      setCurrentRide(null);
      setDriverLocation(null);
      setPickup('');
      setDropoff('');
    }
  };

  const rideTypes = [
    { id: 'standard', name: 'Standard', price: '$12-18', icon: '🚗' },
    { id: 'comfort', name: 'Comfort', price: '$18-25', icon: '🚙' },
    { id: 'premium', name: 'Premium', price: '$25-35', icon: '⭐' },
  ];

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Ride</h2>

        {/* Current Ride Status */}
        {currentRide && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                Ride Status: <span className="text-blue-600 capitalize">{currentRide.status}</span>
              </h3>
              <button onClick={handleCancelRide} className="p-1 hover:bg-blue-100 rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {driverLocation && riderLocation && (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span>🚗</span>
                  <span>Driver is on the way!</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>
                    {Math.round(calculateDistance(
                      riderLocation.lat,
                      riderLocation.lng,
                      driverLocation.lat,
                      driverLocation.lng
                    ) * 1000)} meters away
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>
                    ETA: {Math.round(calculateETA(
                      calculateDistance(
                        riderLocation.lat,
                        riderLocation.lng,
                        driverLocation.lat,
                        driverLocation.lng
                      )
                    ))} minutes
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleBookRide(); }} className="space-y-5">
          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter pickup address"
                  disabled={!!currentRide}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading || !!currentRide}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
              >
                {locationLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Getting...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Current</span>
                  </>
                )}
              </button>
            </div>
            {address && (
              <p className="text-gray-500 text-sm mt-1">📍 {address.city}, {address.country}</p>
            )}
          </div>

          {/* Dropoff Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Where to?"
                disabled={!!currentRide}
                required
              />
            </div>
          </div>

          {/* Ride Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Ride Type</label>
            <div className="grid grid-cols-3 gap-3">
              {rideTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => !currentRide && setRideType(type.id)}
                  disabled={!!currentRide}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    rideType === type.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="font-bold text-sm text-gray-900">{type.name}</div>
                  <div className="text-xs text-gray-600">{type.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={rideLoading || locationLoading || !!currentRide}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {rideLoading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Booking...</span>
              </>
            ) : currentRide ? (
              'Ride in Progress'
            ) : (
              <>
                <span>🚗</span>
                <span>Book Ride Now</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Estimated Fare Card */}
      {pickup && dropoff && !currentRide && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-4">Estimated Fare</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Price Range</p>
                <p className="font-bold text-gray-900">$12 - $35</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Estimated Time</p>
                <p className="font-bold text-gray-900">10 - 15 min</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-xs p-3 bg-gray-100 rounded-lg">
        <div className="h-2 w-2 rounded-full bg-green-600"></div>
        <span className="text-gray-700">Connected to server</span>
      </div>
    </div>
  );
};

export default RideBooking;