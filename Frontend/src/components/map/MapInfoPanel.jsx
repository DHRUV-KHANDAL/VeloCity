// src/components/map/MapInfoPanel.jsx
import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Navigation, Phone, MessageCircle, ChevronDown, ChevronUp, X } from 'lucide-react';

const MapInfoPanel = ({
  title = 'Route Details',
  distance = null,
  eta = null,
  fare = null,
  pickup = null,
  dropoff = null,
  driverName = null,
  driverRating = null,
  driverPhone = null,
  onCall,
  onMessage,
  onClose,
  variant = 'rider'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 max-w-sm w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between cursor-pointer hover:shadow-lg"
           onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Driver/Rider Info */}
          {driverName && (
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {driverName[0]}
              </div>
              <div className="flex-grow">
                <p className="font-bold text-gray-900">{driverName}</p>
                <p className="text-sm text-gray-600">⭐ {driverRating || '4.8'}</p>
              </div>
              <div className="flex gap-2">
                {onCall && (
                  <button
                    onClick={() => onCall(driverPhone)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Call"
                  >
                    <Phone className="h-5 w-5 text-green-600" />
                  </button>
                )}
                {onMessage && (
                  <button
                    onClick={() => onMessage(driverPhone)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Message"
                  >
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Route Information */}
          <div className="space-y-3">
            {pickup && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs text-gray-600 font-semibold">PICKUP</p>
                  <p className="text-sm text-gray-900 font-bold">{pickup}</p>
                </div>
              </div>
            )}

            {dropoff && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs text-gray-600 font-semibold">DROPOFF</p>
                  <p className="text-sm text-gray-900 font-bold">{dropoff}</p>
                </div>
              </div>
            )}
          </div>

          {/* Trip Metrics */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-3 gap-3">
              {distance !== null && (
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <Navigation className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Distance</p>
                  <p className="font-bold text-gray-900">{distance.toFixed(1)} km</p>
                </div>
              )}

              {eta !== null && (
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">ETA</p>
                  <p className="font-bold text-gray-900">{Math.round(eta)} min</p>
                </div>
              )}

              {fare !== null && (
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Fare</p>
                  <p className="font-bold text-green-600">${fare}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapInfoPanel;