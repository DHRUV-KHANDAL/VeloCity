// src/components/rider/RiderLiveMap.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, AlertCircle, Navigation, Clock, DollarSign, Phone, MessageCircle } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';

// ✅ FIX: Import marker icons as URLs (Vite-compatible)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// ✅ FIX: Set default marker icon properly for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Custom icons
const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/747/747376.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/744/744465.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1524/1524921.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const RiderLiveMap = ({ 
  activeRide = null,
  driverLocation = null,
  riderLocation = null,
  showTrackingInfo = true,
  onCancel = null
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [showDetails, setShowDetails] = useState(true);

  const mapRef = useRef(null);
  const { calculateDistance, calculateETA } = useGeolocation();

  const defaultCenter = useMemo(() => [40.7128, -74.0060], []);

  const mapCenter = useMemo(() => {
    if (driverLocation) {
      return [driverLocation.lat, driverLocation.lng];
    }
    if (riderLocation) {
      return [riderLocation.lat, riderLocation.lng];
    }
    return defaultCenter;
  }, [defaultCenter, driverLocation, riderLocation]);

  useEffect(() => {
    if (!driverLocation || !activeRide?.pickupLocation?.coordinates) {
      return;
    }

    const timer = setTimeout(() => {
      const calculatedDistance = calculateDistance(
        driverLocation.lat,
        driverLocation.lng,
        activeRide.pickupLocation.coordinates.lat,
        activeRide.pickupLocation.coordinates.lng
      );

      const calculatedEta = calculateETA(calculatedDistance);

      setDistance(calculatedDistance);
      setEta(calculatedEta);
    }, 0);

    return () => clearTimeout(timer);
  }, [driverLocation, activeRide, calculateDistance, calculateETA]);

  const routeCoordinates = useMemo(() => {
    if (!driverLocation || !activeRide?.pickupLocation?.coordinates) {
      return [];
    }

    return [
      [driverLocation.lat, driverLocation.lng],
      [
        activeRide.pickupLocation.coordinates.lat,
        activeRide.pickupLocation.coordinates.lng
      ]
    ];
  }, [driverLocation, activeRide]);

  const handleMapLoad = useCallback(() => {
    setMapReady(true);
  }, []);

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-xl overflow-hidden">
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        onLoad={handleMapLoad}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Driver Location */}
        {driverLocation && (
          <>
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>
                <div className="text-sm">
                  <strong className="text-gray-900">🚗 Driver</strong><br />
                  <span className="text-gray-600">
                    {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[driverLocation.lat, driverLocation.lng]}
              radius={200}
              pathOptions={{ color: 'blue', fillOpacity: 0.1 }}
            />
          </>
        )}

        {/* Rider Location */}
        {riderLocation && (
          <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-gray-900">📍 You are here</strong><br />
                <span className="text-gray-600">
                  {riderLocation.lat.toFixed(4)}, {riderLocation.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pickup Location */}
        {activeRide?.pickupLocation?.coordinates && (
          <Marker
            position={[
              activeRide.pickupLocation.coordinates.lat,
              activeRide.pickupLocation.coordinates.lng
            ]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-gray-900">📍 Pickup</strong><br />
                <span className="text-gray-700">{activeRide.pickupLocation.address || 'Pickup point'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Location */}
        {activeRide?.dropoffLocation?.coordinates && (
          <Marker
            position={[
              activeRide.dropoffLocation.coordinates.lat,
              activeRide.dropoffLocation.coordinates.lng
            ]}
            icon={dropoffIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-gray-900">🏁 Dropoff</strong><br />
                <span className="text-gray-700">{activeRide.dropoffLocation.address || 'Dropoff point'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="rgb(59, 130, 246)"
            weight={3}
            opacity={0.7}
            dashArray="10, 5"
          />
        )}
      </MapContainer>

      {/* Driver Status Badge */}
      <div className="absolute top-4 left-4 z-40">
        <div className="bg-green-100 text-green-800 rounded-lg shadow-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
          <span>Driver Arriving</span>
        </div>
      </div>

      {/* Tracking Info Card */}
      {showTrackingInfo && activeRide && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-white rounded-xl shadow-xl z-40 transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <h3 className="font-bold text-lg">Driver Details</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              {showDetails ? '▼' : '▶'}
            </button>
          </div>

          {showDetails && (
            <div className="p-4 space-y-4">
              {/* Driver Info */}
              {activeRide.driver && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {activeRide.driver.name?.[0] || '?'}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-gray-900">{activeRide.driver.name || 'Driver'}</p>
                    <p className="text-sm text-gray-600">⭐ {activeRide.driver.rating || '4.8'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Vehicle Info */}
              {activeRide.driver?.vehicle && (
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Vehicle</p>
                    <p className="font-bold text-gray-900">{activeRide.driver.vehicle.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">License Plate</p>
                    <p className="font-bold text-gray-900 text-lg">{activeRide.driver.vehicle.plate}</p>
                  </div>
                </div>
              )}

              {/* Distance & ETA */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <Navigation className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Distance</p>
                  <p className="font-bold text-gray-900">
                    {distance ? `${distance.toFixed(1)} km` : '-'}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">ETA</p>
                  <p className="font-bold text-gray-900">
                    {eta ? `${Math.round(eta)} min` : '-'}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Fare</p>
                  <p className="font-bold text-green-600">
                    ${activeRide.fare?.total || '-'}
                  </p>
                </div>
              </div>

              {/* Cancel Button */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-lg transition-colors"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading Map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderLiveMap;