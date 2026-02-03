// src/components/common/RideCard.jsx
import React from 'react';
import { MapPin, Clock, DollarSign, Star, Phone, MessageCircle, Navigation, MoreVertical } from 'lucide-react';

const RideCard = ({
  rideData,
  onCall,
  onMessage,
  onNavigate,
  onMore,
  variant = 'default'
}) => {
  const { driver, rider, pickupLocation, dropoffLocation, fare, distance, eta, rating, status } = rideData;

  const statusColors = {
    accepted: 'bg-blue-50 border-blue-200',
    in_progress: 'bg-purple-50 border-purple-200',
    completed: 'bg-green-50 border-green-200',
    cancelled: 'bg-red-50 border-red-200'
  };

  const user = variant === 'driver' ? rider : driver;

  return (
    <div className={`rounded-xl shadow-md border-2 ${statusColors[status] || statusColors.accepted} p-4 transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {user?.name?.[0] || '?'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{user?.name || 'User'}</h3>
            <p className="text-sm text-gray-600">⭐ {rating || '4.8'}</p>
          </div>
        </div>
        <button onClick={onMore} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Route Information */}
      <div className="space-y-2 mb-4 py-4 border-y border-gray-200">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <p className="text-xs text-gray-600 font-semibold">PICKUP</p>
            <p className="text-sm font-bold text-gray-900 truncate">{pickupLocation?.address || 'Loading...'}</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-6 ml-2">
          <div className="w-0.5 h-full bg-gray-300"></div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <p className="text-xs text-gray-600 font-semibold">DROPOFF</p>
            <p className="text-sm font-bold text-gray-900 truncate">{dropoffLocation?.address || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <Navigation className="h-4 w-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Distance</p>
          <p className="text-sm font-bold text-gray-900">{distance?.toFixed(1) || '--'} km</p>
        </div>
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <Clock className="h-4 w-4 text-purple-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">ETA</p>
          <p className="text-sm font-bold text-gray-900">{Math.round(eta) || '--'} min</p>
        </div>
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Fare</p>
          <p className="text-sm font-bold text-green-600">${fare?.total || '--'}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onCall}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-green-100 hover:bg-green-200 text-green-600 font-bold rounded-lg transition-colors"
          title="Call"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Call</span>
        </button>
        <button
          onClick={onMessage}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold rounded-lg transition-colors"
          title="Message"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Message</span>
        </button>
        <button
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-600 font-bold rounded-lg transition-colors"
          title="Navigate"
        >
          <Navigation className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Navigate</span>
        </button>
      </div>

      {/* Status Badge */}
      <div className="mt-4 text-center">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          status === 'completed' ? 'bg-green-200 text-green-800' :
          status === 'cancelled' ? 'bg-red-200 text-red-800' :
          status === 'in_progress' ? 'bg-purple-200 text-purple-800' :
          'bg-blue-200 text-blue-800'
        }`}>
          {status?.replace('_', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default RideCard;