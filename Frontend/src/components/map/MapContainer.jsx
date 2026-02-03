// src/components/map/MapContainer.jsx
import React from 'react';
import MapControls from './MapControls';

const MapContainer = ({
  children,
  zoom = 14,
  onZoomIn,
  onZoomOut,
  onCenter,
  onCall,
  onMessage,
  onEmergency,
  onReset,
  onFullscreen,
  isFullscreen = false,
  showEmergency = true,
  showReset = true,
  disabled = false,
  height = 'h-96',
  className = ''
}) => {
  return (
    <div className={`relative w-full ${height} rounded-xl overflow-hidden shadow-lg ${className}`}>
      {/* Map Content */}
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        {children || (
          <div className="text-center">
            <p className="text-gray-600 font-medium">Map Loading...</p>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <MapControls
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onCenter={onCenter}
        onCall={onCall}
        onMessage={onMessage}
        onEmergency={onEmergency}
        onReset={onReset}
        onFullscreen={onFullscreen}
        isFullscreen={isFullscreen}
        showEmergency={showEmergency}
        showReset={showReset}
        disabled={disabled}
      />
    </div>
  );
};

export default MapContainer;