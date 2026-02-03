// src/components/map/TrackingStatus.jsx
import React, { useMemo } from 'react';
import { Activity, MapPin, Navigation, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const TrackingStatus = ({
  isActive = true,
  isLoading = false,
  hasError = false,
  errorMessage = '',
  distance = null,
  eta = null,
  speed = null,
  accuracy = null,
  lastUpdate = null,
  status = 'tracking'
}) => {
  const statusConfig = useMemo(() => ({
    tracking: {
      icon: Activity,
      label: 'Live Tracking Active',
      color: 'bg-green-100 text-green-800 border-green-300',
      dot: 'bg-green-600'
    },
    connecting: {
      icon: Loader,
      label: 'Connecting...',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      dot: 'bg-yellow-600'
    },
    error: {
      icon: AlertCircle,
      label: 'Connection Error',
      color: 'bg-red-100 text-red-800 border-red-300',
      dot: 'bg-red-600'
    },
    offline: {
      icon: AlertCircle,
      label: 'Offline',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      dot: 'bg-gray-600'
    }
  }), []);

  const currentStatus = statusConfig[status] || statusConfig.tracking;
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`rounded-lg shadow-lg border ${currentStatus.color} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${currentStatus.dot} ${status === 'tracking' ? 'animate-pulse' : ''}`}></div>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            <span className="font-bold">{currentStatus.label}</span>
          </div>
        </div>
        {isLoading && <Loader className="h-5 w-5 animate-spin" />}
      </div>

      {/* Error Message */}
      {hasError && errorMessage && (
        <div className="mb-3 p-2 bg-red-50 rounded border border-red-200">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Tracking Information Grid */}
      {isActive && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {distance !== null && (
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 opacity-70" />
              <span className="opacity-75">{distance.toFixed(1)} km</span>
            </div>
          )}
          
          {eta !== null && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 opacity-70" />
              <span className="opacity-75">{Math.round(eta)} min</span>
            </div>
          )}
          
          {speed !== null && (
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 opacity-70" />
              <span className="opacity-75">{Math.round(speed)} km/h</span>
            </div>
          )}
          
          {accuracy !== null && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-70" />
              <span className="opacity-75">±{Math.round(accuracy)}m</span>
            </div>
          )}
        </div>
      )}

      {/* Last Update */}
      {lastUpdate && (
        <div className="mt-3 pt-3 border-t border-current/20 text-xs opacity-75">
          <p>Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

export default TrackingStatus;