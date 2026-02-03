// src/components/driver/DriverMapWrapper.jsx
import React, { useState, useCallback } from 'react';
import { AlertCircle, Navigation, RefreshCw } from 'lucide-react';
import DriverLiveMap from './DriverLiveMap';

const DriverMapWrapper = ({ acceptedRide, onLocationUpdate }) => {
  const [locationUpdates, setLocationUpdates] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLocationUpdate = useCallback((location) => {
    setLocationUpdates(prev => prev + 1);
    setLastUpdate(new Date().toLocaleTimeString());
    
    if (onLocationUpdate) {
      onLocationUpdate(location);
    }
  }, [onLocationUpdate]);

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="h-6 w-6" />
          <div>
            <h3 className="font-bold text-lg">Live Tracking</h3>
            <p className="text-sm text-blue-100">
              {acceptedRide ? 'En route to pickup' : 'Ready for rides'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title={isExpanded ? 'Minimize' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {/* Map Container */}
      <div className={`flex-grow transition-all duration-300 ${isExpanded ? 'h-96' : 'h-64'}`}>
        <DriverLiveMap 
          acceptedRide={acceptedRide}
          onLocationUpdate={handleLocationUpdate}
          showTrackingInfo={true}
        />
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold uppercase">Updates</p>
          <p className="text-2xl font-bold text-blue-600">{locationUpdates}</p>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold uppercase">Last Update</p>
          <p className="text-sm font-bold text-gray-900">
            {lastUpdate ? lastUpdate : '—'}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold uppercase">Status</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
            <span className="text-sm font-bold text-green-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverMapWrapper;