// src/pages/MapTrackingPage.jsx
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DriverLiveMap from '../components/driver/DriverLiveMap';
import MapControls from '../components/map/MapControls';
import RouteInfo from '../components/map/RouteInfo';
import { Phone, MessageCircle } from 'lucide-react';

const MapTrackingPage = () => {
  const { rideId } = useParams();
  const [showInfo, setShowInfo] = useState(true);
  const [mapZoom, setMapZoom] = useState(14);

  // ✅ FIX: Use useMemo for mockRide to prevent recreation
  const mockRide = useMemo(() => ({
    _id: rideId,
    rider: {
      name: 'John Doe',
      rating: 4.8,
      phone: '+1 555 123 4567'
    },
    pickupLocation: {
      address: '123 Main St, Downtown',
      coordinates: { lat: 40.7505, lng: -73.9972 }
    },
    dropoffLocation: {
      address: 'Airport Terminal 4',
      coordinates: { lat: 40.6413, lng: -73.7781 }
    },
    fare: { total: 32.50 },
    distance: 12.5,
    estimatedDuration: 25,
    status: 'in_progress'
  }), [rideId]); // ✅ Only recreates when rideId changes

  const handleZoomIn = useCallback(() => {
    setMapZoom(prev => Math.min(prev + 1, 20));
  }, []);

  const handleZoomOut = useCallback(() => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  }, []);

  const handleCenter = useCallback(() => {
    console.log('Centering map...');
  }, []);

  // ✅ FIX: mockRide is now stable from useMemo
  const handleCall = useCallback(() => {
    if (mockRide?.rider?.phone) {
      window.location.href = `tel:${mockRide.rider.phone}`;
    }
  }, [mockRide]); // ✅ Now properly included in dependencies

  const handleMessage = useCallback(() => {
    console.log('Opening message...');
  }, []);

  const handleEmergency = useCallback(() => {
    console.log('Emergency alert triggered');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 shadow-lg">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Active Ride</h1>
            <p className="text-gray-400 mt-1">Ride ID: {rideId}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">${mockRide.fare.total}</p>
            <p className="text-sm text-gray-400">{mockRide.estimatedDuration} min</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow relative">
        <DriverLiveMap
          acceptedRide={mockRide}
          showTrackingInfo={showInfo}
          onLocationUpdate={(location) => {
            console.log('Location updated:', location);
          }}
        />

        {/* Map Controls */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenter={handleCenter}
          onCall={handleCall}
          onMessage={handleMessage}
          onEmergency={handleEmergency}
          showEmergency={true}
        />

        {/* Route Info Sidebar */}
        <div className="absolute bottom-4 left-4 md:left-auto md:right-4 md:w-80 z-30">
          <RouteInfo
            pickup={mockRide.pickupLocation}
            dropoff={mockRide.dropoffLocation}
            distance={mockRide.distance}
            eta={mockRide.estimatedDuration}
            fare={mockRide.fare.total}
            onClose={() => setShowInfo(!showInfo)}
            expanded={showInfo}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gray-800 text-white p-4 border-t border-gray-700">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {mockRide.rider.name[0]}
            </div>
            <div>
              <p className="font-bold text-white">{mockRide.rider.name}</p>
              <p className="text-sm text-gray-400">⭐ {mockRide.rider.rating}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCall}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              <span className="hidden sm:inline">Call</span>
            </button>
            <button
              onClick={handleMessage}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTrackingPage;