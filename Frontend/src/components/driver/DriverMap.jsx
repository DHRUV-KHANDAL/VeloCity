// src/components/driver/DriverMap.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useGeolocation from '../../hooks/useGeolocation';
import useWebSocket from '../../hooks/useWebSocket';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Custom icons
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

const DriverMap = ({ acceptedRide = null }) => {
  const [riderPickup, setRiderPickup] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [routeToPickup, setRouteToPickup] = useState([]);

  const { 
    location: driverLocation, 
    watchPosition, 
    stopWatching,
    calculateDistance,
    calculateETA,
    formatForAPI
  } = useGeolocation({ watch: true });

  const { sendMessage, lastMessage } = useWebSocket();

  // Use refs
  const acceptedRideRef = useRef(null);
  const driverLocationRef = useRef(null);

  useEffect(() => {
    acceptedRideRef.current = acceptedRide;
  }, [acceptedRide]);

  useEffect(() => {
    driverLocationRef.current = driverLocation;
  }, [driverLocation]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    switch (message.type) {
      case 'new_ride_request':
        setAvailableRides(prev => [...prev, message.data]);
        break;
      
      case 'ride_accepted_confirmation':
        if (message.data.rideId === acceptedRideRef.current?._id) {
          setRiderPickup(message.data.pickupLocation);
          
          if (driverLocationRef.current && message.data.pickupLocation?.coordinates) {
            setRouteToPickup([
              [driverLocationRef.current.lat, driverLocationRef.current.lng],
              [
                message.data.pickupLocation.coordinates.lat,
                message.data.pickupLocation.coordinates.lng
              ]
            ]);
          }
        }
        break;
      
      case 'ride_cancelled':
        if (message.data.rideId === acceptedRideRef.current?._id) {
          setRiderPickup(null);
          setRouteToPickup([]);
        }
        setAvailableRides(prev => 
          prev.filter(ride => ride.rideId !== message.data.rideId)
        );
        break;
    }
  }, []);

  // Use setTimeout to avoid setState in effect
  useEffect(() => {
    if (!lastMessage) return;

    const timer = setTimeout(() => {
      handleWebSocketMessage(lastMessage);
    }, 0);

    return () => clearTimeout(timer);
  }, [lastMessage]);

  // Start tracking driver location
  useEffect(() => {
    const watchId = watchPosition((newLocation) => {
      sendMessage({
        type: 'driver_location_update',
        location: newLocation.coordinates,
        timestamp: Date.now()
      });
    });

    return () => {
      stopWatching();
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchPosition, stopWatching, sendMessage]);

  // Accept a ride
  const handleAcceptRide = (ride) => {
    if (!driverLocation) {
      alert('Please enable location services to accept rides');
      return;
    }

    const distance = calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      ride.pickupLocation.coordinates.lat,
      ride.pickupLocation.coordinates.lng
    );

    const eta = calculateETA(distance);

    sendMessage({
      type: 'driver_accept_ride',
      rideId: ride.rideId,
      driverLocation: formatForAPI(),
      estimatedETA: Math.round(eta)
    });

    setRiderPickup(ride.pickupLocation);
    setAvailableRides([]);
    
    setRouteToPickup([
      [driverLocation.lat, driverLocation.lng],
      [ride.pickupLocation.coordinates.lat, ride.pickupLocation.coordinates.lng]
    ]);
  };

  // Start ride
  const handleStartRide = () => {
    if (!acceptedRide || !riderPickup) return;

    sendMessage({
      type: 'ride_started',
      rideId: acceptedRide._id,
      driverLocation: formatForAPI()
    });
  };

  // Complete ride
  const handleCompleteRide = () => {
    if (!acceptedRide) return;

    sendMessage({
      type: 'ride_completed',
      rideId: acceptedRide._id
    });

    setRiderPickup(null);
    setRouteToPickup([]);
  };

  // Default center
  const defaultCenter = [40.7128, -74.0060];
  const mapCenter = driverLocation ? [driverLocation.lat, driverLocation.lng] : defaultCenter;

  return (
    <div className="driver-map-container">
      <div className="map-header">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Driver Map</h3>
        
        {driverLocation ? (
          <div className="location-status flex items-center gap-2">
            <span className="status-dot online h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-gray-600">Location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}</span>
          </div>
        ) : (
          <div className="location-status flex items-center gap-2">
            <span className="status-dot offline h-3 w-3 rounded-full bg-gray-400"></span>
            <span className="text-gray-600">Waiting for location...</span>
          </div>
        )}
      </div>

      <div className="map-container h-[500px] rounded-lg overflow-hidden border border-gray-300">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>
                <strong>You are here</strong><br />
                {driverLocation.lat.toFixed(6)}, {driverLocation.lng.toFixed(6)}
              </Popup>
            </Marker>
          )}
          
          {riderPickup?.coordinates && (
            <Marker 
              position={[riderPickup.coordinates.lat, riderPickup.coordinates.lng]} 
              icon={pickupIcon}
            >
              <Popup>
                <strong>Rider Pickup</strong><br />
                {riderPickup.address || 'Pickup location'}<br />
                {driverLocation && (
                  <>
                    Distance: {calculateDistance(
                      driverLocation.lat,
                      driverLocation.lng,
                      riderPickup.coordinates.lat,
                      riderPickup.coordinates.lng
                    ).toFixed(2)} km<br />
                    ETA: {Math.round(calculateETA(
                      calculateDistance(
                        driverLocation.lat,
                        driverLocation.lng,
                        riderPickup.coordinates.lat,
                        riderPickup.coordinates.lng
                      )
                    ))} minutes
                  </>
                )}
              </Popup>
            </Marker>
          )}
          
          {availableRides.map((ride, index) => (
            <Marker 
              key={index}
              position={[
                ride.pickupLocation.coordinates.lat,
                ride.pickupLocation.coordinates.lng
              ]}
              icon={new L.Icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png',
                iconSize: [25, 25],
                iconAnchor: [12, 25]
              })}
            >
              <Popup>
                <strong>New Ride Request</strong><br />
                {ride.pickupLocation.address || 'Pickup'}<br />
                {driverLocation && (
                  <>
                    Distance: {calculateDistance(
                      driverLocation.lat,
                      driverLocation.lng,
                      ride.pickupLocation.coordinates.lat,
                      ride.pickupLocation.coordinates.lng
                    ).toFixed(2)} km<br />
                    <button 
                      onClick={() => handleAcceptRide(ride)}
                      className="accept-btn px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Accept Ride
                    </button>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
          
          {routeToPickup.length > 0 && (
            <Polyline
              positions={routeToPickup}
              color="green"
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      {acceptedRide && riderPickup && (
        <div className="ride-info-panel mt-4 bg-white rounded-lg shadow-md p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Current Ride</h4>
          
          <div className="pickup-details">
            <p className="text-gray-700 mb-2"><strong>📍 Pickup:</strong> {riderPickup.address || 'Location not specified'}</p>
            
            {driverLocation && (
              <div className="navigation-info space-y-2">
                <p className="text-gray-700">
                  <strong>Distance to pickup:</strong> {
                    calculateDistance(
                      driverLocation.lat,
                      driverLocation.lng,
                      riderPickup.coordinates.lat,
                      riderPickup.coordinates.lng
                    ).toFixed(2)
                  } km
                </p>
                <p className="text-gray-700">
                  <strong>ETA:</strong> {
                    calculateETA(
                      calculateDistance(
                        driverLocation.lat,
                        driverLocation.lng,
                        riderPickup.coordinates.lat,
                        riderPickup.coordinates.lng
                      )
                    ).toFixed(0)
                  } minutes
                </p>
                
                <div className="action-buttons flex flex-wrap gap-2 mt-3">
                  <button 
                    className="navigate-btn px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${
                          riderPickup.coordinates.lat
                        },${
                          riderPickup.coordinates.lng
                        }&travelmode=driving`
                      );
                    }}
                  >
                    🧭 Open in Maps
                  </button>
                  
                  <button 
                    className="start-ride-btn px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    onClick={handleStartRide}
                  >
                    🚗 Start Ride
                  </button>
                  
                  <button 
                    className="complete-ride-btn px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                    onClick={handleCompleteRide}
                  >
                    ✅ Complete Ride
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {availableRides.length > 0 && !acceptedRide && (
        <div className="available-rides-panel mt-4 bg-white rounded-lg shadow-md p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Available Rides ({availableRides.length})</h4>
          <div className="rides-list space-y-3">
            {availableRides.map((ride, index) => (
              <div key={index} className="ride-card border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors">
                <p className="text-gray-700"><strong>Pickup:</strong> {ride.pickupLocation.address || 'Location'}</p>
                {driverLocation && (
                  <p className="text-gray-700">
                    <strong>Distance:</strong> {
                      calculateDistance(
                        driverLocation.lat,
                        driverLocation.lng,
                        ride.pickupLocation.coordinates.lat,
                        ride.pickupLocation.coordinates.lng
                      ).toFixed(2)
                    } km
                  </p>
                )}
                <button 
                  onClick={() => handleAcceptRide(ride)}
                  className="accept-ride-btn mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Accept Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverMap;