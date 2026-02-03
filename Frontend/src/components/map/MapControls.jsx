// src/components/map/MapControls.jsx
import React from 'react';
import { ZoomIn, ZoomOut, Navigation, Phone, MessageCircle, AlertTriangle, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';

const MapControls = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  onCall,
  onMessage,
  onEmergency,
  onReset,
  onFullscreen,
  showEmergency = true,
  showReset = true,
  disabled = false,
  isFullscreen = false
}) => {
  return (
    <div className="absolute right-4 top-4 z-40 flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <button
          onClick={onZoomIn}
          disabled={disabled}
          title="Zoom In"
          className="p-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <div className="h-px bg-gray-200"></div>
        <button
          onClick={onZoomOut}
          disabled={disabled}
          title="Zoom Out"
          className="p-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <div className="h-px bg-gray-200"></div>
        <button
          onClick={onCenter}
          disabled={disabled}
          title="Center Map"
          className="p-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Navigation className="h-5 w-5" />
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <button
          onClick={onCall}
          disabled={disabled}
          title="Call"
          className="p-3 hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Phone className="h-5 w-5" />
        </button>
        <div className="h-px bg-gray-200"></div>
        <button
          onClick={onMessage}
          disabled={disabled}
          title="Message"
          className="p-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        <div className="h-px bg-gray-200"></div>
        <button
          onClick={onFullscreen}
          disabled={disabled}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="p-3 hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Additional Controls */}
      <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {showReset && (
          <>
            <button
              onClick={onReset}
              disabled={disabled}
              title="Reset Map"
              className="p-3 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            {showEmergency && <div className="h-px bg-gray-200"></div>}
          </>
        )}
        
        {showEmergency && (
          <button
            onClick={onEmergency}
            disabled={disabled}
            title="Emergency Alert"
            className="p-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium animate-pulse hover:animate-none"
          >
            <AlertTriangle className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 text-xs space-y-2 max-w-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-gray-700">Driver</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-700">Rider</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-700">Pickup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-gray-700">Dropoff</span>
        </div>
      </div>
    </div>
  );
};

export default MapControls;