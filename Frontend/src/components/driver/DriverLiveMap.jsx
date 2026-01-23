// src/components/driver/DriverLiveMap.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import useGeolocation from "../../hooks/useGeolocation";
import "./DriverLiveMap.css";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url,
  ).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
});

// Custom icons
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const rideIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3237/3237472.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const DriverLiveMap = ({ fakeRides = [] }) => {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]);
  const mapRef = useRef(null);

  const {
    location: driverLocation,
    isLoading: locationLoading,
    error: locationError,
    calculateDistance,
  } = useGeolocation({ watch: true });

  // Center map on driver location when available
  useEffect(() => {
    if (driverLocation) {
      setMapCenter([driverLocation.lat, driverLocation.lng]);
    }
  }, [driverLocation]);

  return (
    <div className="driver-live-map bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          📍 Live Location Map
          {driverLocation && (
            <span className="ml-auto text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
              🟢 Online
            </span>
          )}
        </h3>
      </div>

      {/* Map */}
      <div className="relative h-[400px]">
        {locationLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Getting your location...</p>
            </div>
          </div>
        )}

        {locationError && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center text-red-600">
              <p className="font-medium">Location Error</p>
              <p className="text-sm">{locationError}</p>
            </div>
          </div>
        )}

        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Driver marker */}
          {driverLocation && (
            <Marker
              position={[driverLocation.lat, driverLocation.lng]}
              icon={driverIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong className="text-cyan-600">🚗 You</strong>
                  <br />
                  <span className="text-xs text-gray-600">
                    {driverLocation.lat.toFixed(6)},{" "}
                    {driverLocation.lng.toFixed(6)}
                  </span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Fake ride markers */}
          {fakeRides.map((ride, idx) => (
            <Marker
              key={idx}
              position={[ride.pickupLocation.lat, ride.pickupLocation.lng]}
              icon={rideIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="text-blue-600">🚗 Fake Ride</strong>
                  <br />
                  <strong>{ride.rider?.name || "Rider"}</strong>
                  <br />
                  📍 {ride.pickupLocation.address || "Location"}
                  <br />
                  {driverLocation && (
                    <span className="text-xs text-gray-600">
                      {calculateDistance(
                        driverLocation.lat,
                        driverLocation.lng,
                        ride.pickupLocation.lat,
                        ride.pickupLocation.lng,
                      ).toFixed(2)}{" "}
                      km away
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-3 py-2 text-xs text-gray-600 border-t">
        {driverLocation
          ? `🟢 Driver at ${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)} | ${fakeRides.length} fake rides nearby`
          : "⚪ Waiting for driver location..."}
      </div>
    </div>
  );
};

export default DriverLiveMap;
