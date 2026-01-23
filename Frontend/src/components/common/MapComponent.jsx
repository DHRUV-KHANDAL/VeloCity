import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Clock, DollarSign, X } from "lucide-react";

const MapComponent = ({
  riderLocation,
  driverLocation,
  pickupLocation,
  dropoffLocation,
  distance,
  estimatedTime,
  fare,
  isActive = true,
  onClose = null,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const riderMarker = useRef(null);
  const driverMarker = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Simple map implementation using custom canvas
  useEffect(() => {
    if (!mapContainer.current || !isActive) return;

    const initMap = () => {
      const canvas = mapContainer.current;
      const ctx = canvas.getContext("2d");

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      drawMap();
    };

    const drawMap = () => {
      if (!mapContainer.current) return;

      const canvas = mapContainer.current;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let i = 0; i < width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw locations
      if (pickupLocation) {
        drawLocation(ctx, width * 0.3, height * 0.3, "#10b981", "P");
      }
      if (dropoffLocation) {
        drawLocation(ctx, width * 0.7, height * 0.7, "#ef4444", "D");
      }
      if (riderLocation) {
        drawLocation(ctx, width * 0.4, height * 0.4, "#3b82f6", "R");
      }
      if (driverLocation) {
        drawLocation(ctx, width * 0.5, height * 0.5, "#f59e0b", "Dr");
      }

      // Draw line between pickup and dropoff
      if (pickupLocation && dropoffLocation) {
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width * 0.3, height * 0.3);
        ctx.lineTo(width * 0.7, height * 0.7);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const drawLocation = (ctx, x, y, color, label) => {
      // Draw marker circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw marker border
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Draw label
      ctx.fillStyle = "#000";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y);
    };

    initMap();

    // Redraw on window resize
    const handleResize = () => {
      if (mapContainer.current) {
        drawMap();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    riderLocation,
    driverLocation,
    pickupLocation,
    dropoffLocation,
    isActive,
  ]);

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Map Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Live Tracking
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="hover:bg-blue-800 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Map Canvas */}
      <div className="w-full h-96 bg-gray-100 relative">
        <canvas
          ref={mapContainer}
          className="w-full h-full"
          style={{
            background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
          }}
        />
      </div>

      {/* Map Info Footer */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-t">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Distance</p>
            <p className="font-semibold">{distance?.toFixed(1) || "0"} km</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Est. Time</p>
            <p className="font-semibold">{estimatedTime || "0"} min</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Fare</p>
            <p className="font-semibold">${fare?.toFixed(2) || "0.00"}</p>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="px-4 py-3 bg-white border-t space-y-2">
        {pickupLocation && (
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">Pickup</p>
              <p className="text-sm font-medium text-gray-800">
                {pickupLocation.address || "Pickup Location"}
              </p>
            </div>
          </div>
        )}

        {dropoffLocation && (
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">Dropoff</p>
              <p className="text-sm font-medium text-gray-800">
                {dropoffLocation.address || "Dropoff Location"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600 flex gap-4 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full" /> Pickup
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full" /> Dropoff
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full" /> Rider
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-amber-500 rounded-full" /> Driver
        </span>
      </div>
    </div>
  );
};

export default MapComponent;
