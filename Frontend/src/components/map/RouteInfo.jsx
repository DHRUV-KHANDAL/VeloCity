// src/components/map/RouteInfo.jsx
import React from 'react';
import { MapPin, Navigation, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

const RouteInfo = ({
  pickup,
  dropoff,
  distance,
  eta,
  fare,
  onClose,
  expanded = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between cursor-pointer hover:shadow-lg"
           onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="font-bold text-lg">Route Details</h3>
        <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Pickup Location */}
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-grow">
              <p className="text-xs text-gray-600 font-semibold uppercase">Pickup</p>
              <p className="text-sm text-gray-900 font-bold">{pickup?.address || 'Loading...'}</p>
              {pickup?.coordinates && (
                <p className="text-xs text-gray-500 mt-1">
                  📍 {pickup.coordinates.lat.toFixed(4)}, {pickup.coordinates.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          {/* Connection Line */}
          <div className="ml-4 flex flex-col items-center h-8">
            <div className="h-1 w-1 rounded-full bg-gray-400"></div>
            <div className="flex-grow w-0.5 bg-gray-300 my-1"></div>
            <div className="h-1 w-1 rounded-full bg-gray-400"></div>
          </div>

          {/* Dropoff Location */}
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-grow">
              <p className="text-xs text-gray-600 font-semibold uppercase">Dropoff</p>
              <p className="text-sm text-gray-900 font-bold">{dropoff?.address || 'Loading...'}</p>
              {dropoff?.coordinates && (
                <p className="text-xs text-gray-500 mt-1">
                  📍 {dropoff.coordinates.lat.toFixed(4)}, {dropoff.coordinates.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Trip Information Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Distance */}
            <div className="bg-blue-50 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors">
              <Navigation className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-semibold">Distance</p>
              <p className="font-bold text-gray-900 text-sm mt-1">
                {distance ? `${distance.toFixed(1)} km` : '--'}
              </p>
            </div>

            {/* ETA */}
            <div className="bg-purple-50 rounded-lg p-3 text-center hover:bg-purple-100 transition-colors">
              <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-semibold">ETA</p>
              <p className="font-bold text-gray-900 text-sm mt-1">
                {eta ? `${Math.round(eta)} min` : '--'}
              </p>
            </div>

            {/* Fare */}
            <div className="bg-green-50 rounded-lg p-3 text-center hover:bg-green-100 transition-colors">
              <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-semibold">Fare</p>
              <p className="font-bold text-green-600 text-sm mt-1">
                ${fare || '--'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteInfo;