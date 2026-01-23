// src/components/rider/RideBooking.jsx - Complete Ride Booking Component
import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  X,
  MessageSquare,
  Phone,
  Star,
  Navigation,
  AlertCircle,
  CheckCircle,
  Loader,
  ChevronDown,
} from "lucide-react";
import useGeolocation from "../../hooks/useGeolocation";
import useWebSocket from "../../hooks/useWebSocket";
import useRide from "../../hooks/useRide";
import useAuth from "../../hooks/useAuth";
import MapComponent from "../common/MapComponent";
import OTPVerification from "../common/OTPVerification";
import RideRating from "../common/RideRating";
import NearbyDriversModal from "./NearbyDriversModal";

// Generate mock drivers for demo purposes
const generateMockDrivers = (count = 5) => {
  const drivers = [];
  const driverNames = [
    "Ahmed Khan",
    "Priya Sharma",
    "Mohammed Ali",
    "Fatima Ahmed",
    "Raj Patel",
    "Sofia Rodriguez",
  ];

  for (let i = 0; i < count && i < driverNames.length; i++) {
    drivers.push({
      _id: `driver_${i + 1}`,
      name: driverNames[i],
      rating: (4.5 + Math.random() * 0.5).toFixed(1),
      location: {
        coordinates: {
          lat: 28.7041 + (Math.random() - 0.5) * 0.05,
          lng: 77.1025 + (Math.random() - 0.5) * 0.05,
        },
      },
      vehicle: {
        type: ["Car", "Premium", "Bike"][Math.floor(Math.random() * 3)],
        number: `DL${Math.floor(Math.random() * 9000) + 1000}`,
      },
    });
  }
  return drivers;
};

const RideBooking = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [rideType, setRideType] = useState("standard");
  const [currentRide, setCurrentRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [riderLat, setRiderLat] = useState(null);
  const [riderLng, setRiderLng] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [bookingStep, setBookingStep] = useState("form");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNearbyDrivers, setShowNearbyDrivers] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  const { user } = useAuth();
  const {
    location: riderLocation,
    address,
    isLoading: locationLoading,
    getCurrentPosition,
  } = useGeolocation();
  const {
    isConnected,
    rideAccepted,
    driverLocationUpdated,
    broadcastNewRide,
    joinRide,
    updateRiderLocation,
  } = useWebSocket();
  const { bookRide, loading: rideLoading, api } = useRide();

  // Get current position on mount
  useEffect(() => {
    getCurrentPosition();
  }, []); // ✅ Empty dependency array - only run once on mount

  // Update rider location periodically
  useEffect(() => {
    // Guard: need user and valid ride state
    if (!user?.id || !currentRide) return;
    if (
      !["otp_pending", "in_progress", "driver_arrived"].includes(
        currentRide?.status,
      )
    )
      return;

    const interval = setInterval(() => {
      if (riderLocation?.lat && riderLocation?.lng && updateRiderLocation) {
        setRiderLat(riderLocation.lat);
        setRiderLng(riderLocation.lng);
        try {
          updateRiderLocation(
            user.id,
            { lat: riderLocation.lat, lng: riderLocation.lng },
            currentRide._id,
          );
        } catch (err) {
          console.error("Error updating rider location:", err);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentRide, riderLocation, user?.id, updateRiderLocation]);

  // Listen for ride acceptance
  useEffect(() => {
    if (rideAccepted?.ride?._id) {
      const rideId = rideAccepted.ride._id;
      // Only process if this is for our current ride
      if (rideId === currentRide?._id) {
        setCurrentRide((prev) => ({
          ...prev,
          driver: rideAccepted.ride.driver,
          status: "accepted",
        }));
        setBookingStep("found");
        setSuccess("Driver found! Heading to you...");
        setTimeout(() => setSuccess(""), 3000);
        // Use rideId directly instead of currentRide._id which might be stale
        if (joinRide && typeof joinRide === "function") {
          joinRide(rideId);
        }
      }
    }
  }, [rideAccepted, currentRide?._id, joinRide]);

  // Listen for driver location updates
  useEffect(() => {
    if (driverLocationUpdated && currentRide) {
      setDriverLocation(driverLocationUpdated.location);
    }
  }, [driverLocationUpdated, currentRide]);

  const handleUseCurrentLocation = async () => {
    const locationData = await getCurrentPosition();
    if (locationData) {
      setPickup(locationData.address?.formatted || "Current Location");
      setRiderLat(locationData.lat);
      setRiderLng(locationData.lng);
    }
  };

  const handleBookRide = async () => {
    // Validate user and locations
    if (!user || !user.id) {
      setError("Please log in first");
      return;
    }
    if (!pickup || !dropoff) {
      setError("Please enter both locations");
      return;
    }

    // Vehicle type mapping for ride types
    const vehicleTypeMap = {
      standard: "car",
      premium: "premium",
      bike: "bike",
    };

    const rideData = {
      pickupLocation: {
        address: pickup,
        coordinates: { lat: riderLat || 0, lng: riderLng || 0 },
      },
      dropoffLocation: {
        address: dropoff,
        coordinates: { lat: 0, lng: 0 },
      },
      vehicleType: vehicleTypeMap[rideType] || "car",
    };

    const result = await bookRide(rideData);
    if (result.success) {
      const ride = result.ride;
      setCurrentRide(ride);

      // Simulate fetching nearby drivers (in production, backend would return this)
      const mockDrivers = generateMockDrivers(5);
      setNearbyDrivers(mockDrivers);
      setShowNearbyDrivers(true);

      setBookingStep("searching");
      broadcastNewRide({
        rideId: ride._id,
        rider: { id: user?.id, name: user?.name, phone: user?.phone },
        pickupLocation: rideData.pickupLocation,
        fare: ride.fare,
        rideType,
      });
    }
  };

  const handleCancelRide = async () => {
    if (currentRide) {
      try {
        await api.post(`/rides/${currentRide._id}/cancel`, {
          reason: "Cancelled by rider",
        });
      } catch (err) {
        console.error("Cancel error:", err);
      }
    }
    setCurrentRide(null);
    setBookingStep("form");
    setPickup("");
    setDropoff("");
  };

  const handleVerifyOTP = async (otpCode) => {
    try {
      const response = await api.post(`/rides/${currentRide._id}/verify-otp`, {
        otp: otpCode,
      });
      if (response.data.success) {
        setCurrentRide((prev) => ({ ...prev, status: "in_progress" }));
        setBookingStep("in_progress");
        setShowOTP(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
      throw err;
    }
  };

  const handleSubmitRating = async (ratingData) => {
    try {
      await api.post(`/rides/${currentRide._id}/rate`, ratingData);
      setShowRating(false);
      setBookingStep("completed");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit rating");
    }
  };

  const rideTypes = [
    { id: "standard", name: "Standard", price: "$12-18", icon: "🚗" },
    { id: "comfort", name: "Comfort", price: "$18-25", icon: "🚙" },
    { id: "premium", name: "Premium", price: "$25-35", icon: "⭐" },
  ];

  return (
    <div className="space-y-6">
      {/* Error & Success Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Current Ride Status */}
      {currentRide && (
        <div
          className={`rounded-xl shadow-lg p-6 border-l-4 ${
            currentRide.status === "accepted"
              ? "bg-green-50 border-green-600"
              : "bg-blue-50 border-blue-600"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Status:{" "}
              <span
                className={`capitalize ${currentRide.status === "accepted" ? "text-green-600" : "text-blue-600"}`}
              >
                {currentRide.status === "requested" && "🔍 Finding Driver"}
                {currentRide.status === "accepted" && "🚗 Driver Arriving"}
                {currentRide.status === "driver_arrived" && "📍 Driver Arrived"}
                {currentRide.status === "otp_pending" && "🔐 OTP Pending"}
                {currentRide.status === "in_progress" && "🛣️ Ride In Progress"}
              </span>
            </h3>
            {["requested", "accepted", "driver_arrived"].includes(
              currentRide.status,
            ) && (
              <button
                onClick={handleCancelRide}
                className="p-1 hover:bg-gray-200 rounded transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Driver Info */}
          {currentRide.driver && (
            <div className="space-y-3 text-sm mb-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {currentRide.driver.name?.[0] || "?"}
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-gray-900">
                    {currentRide.driver.name}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {currentRide.driver.rating?.toFixed(1) || "4.5"}
                  </p>
                </div>
              </div>

              {/* Live Map */}
              <MapComponent
                riderLocation={riderLocation}
                driverLocation={driverLocation}
                pickupLocation={currentRide.pickupLocation}
                dropoffLocation={currentRide.dropoffLocation}
                distance={currentRide.distance}
                estimatedTime={currentRide.estimatedDuration}
                fare={currentRide.fare?.total}
              />

              {/* Driver Actions */}
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" /> Call
                </button>
                <button className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Message
                </button>
              </div>
            </div>
          )}

          {/* Waiting for driver */}
          {!currentRide.driver && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-3">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">
                Finding nearby drivers...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This usually takes less than a minute
              </p>
            </div>
          )}
        </div>
      )}

      {/* Booking Form */}
      {!currentRide && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Ride</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBookRide();
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter pickup address"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium whitespace-nowrap"
                >
                  {locationLoading ? "⏳" : "📍"} Use Location
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dropoff Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Where to?"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Ride Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {rideTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setRideType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${rideType === type.id ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="font-bold text-sm text-gray-900">
                      {type.name}
                    </div>
                    <div className="text-xs text-gray-600">{type.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={rideLoading || locationLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {rideLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Booking...
                </>
              ) : (
                "🚗 Book Ride Now"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Estimated Fare */}
      {pickup && dropoff && !currentRide && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-4">Estimated Fare</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Price Range</p>
                <p className="font-bold text-gray-900">
                  $
                  {rideType === "standard"
                    ? "12"
                    : rideType === "comfort"
                      ? "18"
                      : "25"}{" "}
                  - $
                  {rideType === "standard"
                    ? "25"
                    : rideType === "comfort"
                      ? "35"
                      : "50"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Estimated Time</p>
                <p className="font-bold text-gray-900">10 - 15 min</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-xs p-3 bg-gray-50 rounded-lg">
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-600" : "bg-red-600"}`}
        />
        <span className="text-gray-700">
          {isConnected ? "Connected to server" : "Connecting..."}
        </span>
      </div>

      {/* OTP Modal */}
      {showOTP && (
        <OTPVerification
          onVerify={handleVerifyOTP}
          onCancel={() => setShowOTP(false)}
          phoneNumber={currentRide?.rider?.phone || "*****"}
          rideId={currentRide?._id}
        />
      )}

      {/* Rating Modal */}
      {showRating && (
        <RideRating
          ride={currentRide}
          userRole="rider"
          otherUserName={currentRide?.driver?.name}
          otherUserRating={currentRide?.driver?.rating}
          onSubmit={handleSubmitRating}
          onClose={() => setShowRating(false)}
        />
      )}

      {/* Nearby Drivers Modal */}
      <NearbyDriversModal
        isOpen={showNearbyDrivers}
        onClose={() => setShowNearbyDrivers(false)}
        drivers={nearbyDrivers}
        pickupLocation={{
          address: pickup,
          coordinates: { lat: riderLat, lng: riderLng },
        }}
        rideData={{ rideType, dropoff }}
      />
    </div>
  );
};

export default RideBooking;
