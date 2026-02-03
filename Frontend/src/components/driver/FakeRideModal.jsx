// src/components/driver/FakeRideModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Clock, DollarSign, User, Zap, CheckCircle } from 'lucide-react';

const FakeRideModal = ({ 
  ride, 
  onAccept, 
  onDecline, 
  isAccepted = false,
  isVisible = true 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const rideRef = useRef(null);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    rideRef.current = ride;
  }, [ride]);

  useEffect(() => {
    if (!ride || !isVisible) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 0);
      timeoutsRef.current.push(timer);
      return () => {
        timeoutsRef.current.forEach(t => clearTimeout(t));
        timeoutsRef.current = [];
      };
    }

    const showTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 0);
    timeoutsRef.current.push(showTimer);

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [ride, isVisible]);

  if (!ride || !isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isAnimating && !isAccepted ? 'bg-black/20 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Modal Card */}
      <div 
        className={`fixed z-50 transition-all duration-300 transform ${
          isAccepted 
            ? 'bottom-4 right-4 w-48 h-20 opacity-90' 
            : 'bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 w-96 opacity-100'
        } ${
          isAnimating ? 'scale-100' : 'scale-95'
        }`}
      >
        {!isAccepted ? (
          // Full Ride Request Card
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-l-4 border-cyan-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-grow">
                <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center animate-pulse">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm">New Ride Request!</p>
                  <p className="text-xs text-cyan-100">Near your location</p>
                </div>
              </div>
              <button
                onClick={onDecline}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors flex-shrink-0"
                title="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* Passenger Info */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {ride.rider?.name?.[0] || '?'}
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="font-bold text-gray-900 text-sm">{ride.rider?.name || 'Rider'}</p>
                  <p className="text-gray-600 text-xs">{ride.rider?.phone || '📞'}</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex-shrink-0">
                  {ride.rating || '4.8★'}
                </span>
              </div>

              {/* Route */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-xs">Pickup</p>
                    <p className="text-gray-600 break-words text-xs">{ride.pickupLocation?.address || 'Address not provided'}</p>
                  </div>
                </div>

                {ride.dropoffLocation?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-xs">Dropoff</p>
                      <p className="text-gray-600 break-words text-xs">{ride.dropoffLocation.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trip Info Grid */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Clock className="h-3 w-3 text-gray-400 mx-auto mb-0.5" />
                  <p className="text-xs text-gray-600">Time</p>
                  <p className="font-bold text-gray-900 text-xs">{ride.estimatedDuration || 5} min</p>
                </div>
                <div className="text-center">
                  <MapPin className="h-3 w-3 text-gray-400 mx-auto mb-0.5" />
                  <p className="text-xs text-gray-600">Distance</p>
                  <p className="font-bold text-gray-900 text-xs">{ride.distance || '5'} km</p>
                </div>
                <div className="text-center">
                  <DollarSign className="h-3 w-3 text-gray-400 mx-auto mb-0.5" />
                  <p className="text-xs text-gray-600">Fare</p>
                  <p className="font-bold text-green-600 text-xs">${ride.fare?.total || '12.50'}</p>
                </div>
              </div>

              {/* Ride Type & Rating */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-blue-50 rounded text-center">
                  <p className="text-xs text-gray-600">Type</p>
                  <p className="font-bold text-gray-900 text-xs">{ride.rideType || 'Standard'}</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded text-center">
                  <p className="text-xs text-gray-600">Rating</p>
                  <p className="font-bold text-gray-900 text-xs">{ride.rating || '4.9★'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-4 py-3 flex gap-2 border-t">
              <button
                onClick={onDecline}
                className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition-colors text-xs"
              >
                ❌ Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-lg font-bold transition-all shadow-md text-xs flex items-center justify-center gap-1"
              >
                <Zap className="h-3 w-3" />
                Accept
              </button>
            </div>
          </div>
        ) : (
          // Accepted - Shrunk Card
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-xl p-3 border-l-4 border-green-400 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle className="h-5 w-5 flex-shrink-0 animate-bounce" />
              <div className="min-w-0">
                <p className="font-bold text-xs">{ride.rider?.name}</p>
                <p className="text-xs opacity-90 truncate">${ride.fare?.total}</p>
              </div>
            </div>
            <span className="text-xs font-bold flex-shrink-0">✓</span>
          </div>
        )}
      </div>
    </>
  );
};

export default FakeRideModal;