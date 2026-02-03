// src/pages/RiderDashboard.jsx - Updated with MapContainer
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import MapContainer from '../components/map/MapContainer';
import useMapControls from '../hooks/useMapControls';

const RiderDashboard = () => {
  const { user } = useAuth();
  const mapControls = useMapControls();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome, {user?.name}! 👋</h1>

        {/* Map Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Map</h2>
          <MapContainer
            height="h-96"
            zoom={mapControls.zoom}
            onZoomIn={mapControls.handleZoomIn}
            onZoomOut={mapControls.handleZoomOut}
            onCenter={mapControls.handleCenter}
            onCall={mapControls.handleCall}
            onMessage={mapControls.handleMessage}
            onEmergency={mapControls.handleEmergency}
            onReset={mapControls.handleReset}
            onFullscreen={mapControls.handleFullscreen}
            isFullscreen={mapControls.isFullscreen}
          />
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;