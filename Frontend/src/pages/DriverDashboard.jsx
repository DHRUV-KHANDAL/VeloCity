// src/pages/DriverDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import useWebSocket from "../hooks/useWebSocket";
import useGeolocation from "../hooks/useGeolocation";
import FakeRideModal from "../components/driver/FakeRideModal";
import DriverLiveMap from "../components/driver/DriverLiveMap";
import {
  Car,
  DollarSign,
  Star,
  Clock,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  Navigation,
  Volume2,
  VolumeX,
} from "lucide-react";

const DriverDashboard = () => {
  const { user } = useAuth();
  const { location: driverLocationFromHook } = useGeolocation({ watch: true });
  const [isOnline, setIsOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState([]);
  const [acceptedRide, setAcceptedRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [fakeRides, setFakeRides] = useState([]);
  const [showFakeModal, setShowFakeModal] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const fakeRideIntervalRef = useRef(null);

  // Sync driverLocation from geolocation hook
  useEffect(() => {
    if (driverLocationFromHook) {
      setDriverLocation(driverLocationFromHook);
    }
  }, [driverLocationFromHook]);

  // Play alert sound
  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAABAZG0",
      );
      audio.play().catch(() => {});
    } catch (e) {
      console.warn("Could not play alert sound:", e);
    }
  }, [soundEnabled]);

  const {
    isConnected,
    newRideAvailable,
    rideTaken,
    rideAccepted,
    acceptRide,
    joinRide,
  } = useWebSocket();

  const stats = [
    {
      icon: Car,
      label: "Rides Today",
      value: "12",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: DollarSign,
      label: "Earnings Today",
      value: "$324.50",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Star,
      label: "Rating",
      value: "4.9★",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Clock,
      label: "Hours Online",
      value: "8h 30m",
      color: "from-purple-500 to-purple-600",
    },
  ];

  // Generate fake rides when going online
  useEffect(() => {
    if (isOnline) {
      // Start generating fake rides every 8-15 seconds
      const generateFakeRide = () => {
        const names = [
          "Alice",
          "Bob",
          "Charlie",
          "Diana",
          "Eve",
          "Frank",
          "Grace",
          "Henry",
        ];
        const phones = [
          "+1-555-0101",
          "+1-555-0102",
          "+1-555-0103",
          "+1-555-0104",
        ];
        const addresses = [
          "123 Main St, New York, NY",
          "456 Oak Ave, Brooklyn, NY",
          "789 Pine Rd, Queens, NY",
          "321 Elm St, Manhattan, NY",
          "654 Maple Dr, Bronx, NY",
        ];

        const newRide = {
          rideId: `fake_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          rider: {
            name: names[Math.floor(Math.random() * names.length)],
            phone: phones[Math.floor(Math.random() * phones.length)],
          },
          pickupLocation: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.05,
            lng: -74.006 + (Math.random() - 0.5) * 0.05,
            address: addresses[Math.floor(Math.random() * addresses.length)],
          },
          fare: {
            total: (10 + Math.random() * 30).toFixed(2),
          },
          estimatedDuration: Math.floor(3 + Math.random() * 10),
          rideType: ["Standard", "Comfort", "XL"][
            Math.floor(Math.random() * 3)
          ],
        };

        setFakeRides((prev) => [...prev.slice(-4), newRide]); // Keep max 5 fake rides
        setShowFakeModal(newRide);
        playAlertSound();
        // Auto-close modal after 8 seconds if no action
        setTimeout(() => {
          setShowFakeModal(null);
        }, 8000);
      };

      // Generate first fake ride immediately
      setTimeout(generateFakeRide, 1000);

      // Then generate every 8-15 seconds
      fakeRideIntervalRef.current = setInterval(
        () => {
          generateFakeRide();
        },
        8000 + Math.random() * 7000,
      );
    } else {
      // Clean up when going offline
      if (fakeRideIntervalRef.current) {
        clearInterval(fakeRideIntervalRef.current);
        fakeRideIntervalRef.current = null;
      }
      setFakeRides([]);
      setShowFakeModal(null);
    }

    return () => {
      if (fakeRideIntervalRef.current) {
        clearInterval(fakeRideIntervalRef.current);
      }
    };
  }, [isOnline, playAlertSound]);

  // Auto-close modal timer cleanup
  useEffect(() => {
    return () => {
      // Clear any pending auto-close timers when component unmounts or modal changes
    };
  }, []);

  // Listen for new ride requests
  useEffect(() => {
    if (newRideAvailable && isOnline) {
      setAvailableRides((prev) => [...prev, newRideAvailable]);
    }
  }, [newRideAvailable, isOnline]);

  // Listen for ride being taken by another driver
  useEffect(() => {
    if (rideTaken) {
      setAvailableRides((prev) =>
        prev.filter((ride) => ride.rideId !== rideTaken.rideId),
      );
    }
  }, [rideTaken]);

  // Driver location is now handled by geolocation hook sync above

  const handleAcceptRide = (ride) => {
    if (ride.rideId?.startsWith("fake_")) {
      // Handle fake ride
      setFakeRides((prev) => prev.filter((r) => r.rideId !== ride.rideId));
      setAcceptedRide(ride);
      setShowFakeModal(null);
    } else {
      // Real ride logic
      acceptRide(ride.rideId, user?.id);
      setAcceptedRide(ride);
      joinRide(ride.rideId);
      setAvailableRides((prev) => prev.filter((r) => r.rideId !== ride.rideId));
    }
  };

  const handleDeclineRide = (ride) => {
    if (ride.rideId?.startsWith("fake_")) {
      setFakeRides((prev) => prev.filter((r) => r.rideId !== ride.rideId));
      setShowFakeModal(null);
    }
  };

  const handleCloseModal = () => {
    setShowFakeModal(null);
  };

  const handleCancelRide = () => {
    setAcceptedRide(null);
    setDriverLocation(null);
  };

  return (
    <div
      className="min-h-screen py-8"
      style={{
        background:
          "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #0f1428 50%, #1a1f3a 75%, #0a0e27 100%)",
        backgroundAttachment: "fixed",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Futuristic car interior effect */
        .driver-dashboard::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(0, 150, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(150, 0, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }
        
        /* Neon lines effect */
        .driver-dashboard::after {
          content: '';
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00FFFF, transparent);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
          animation: scanlines 8s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes scanlines {
          0%, 100% { bottom: 0; opacity: 0; }
          50% { bottom: 50%; opacity: 1; }
        }
        
        .driver-dashboard {
          position: relative;
          z-index: 2;
        }
      `}</style>
      <div className="driver-dashboard">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header with Status Toggle */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome, {user?.name}! 👋
              </h1>
              <p className="text-blue-200">Manage your rides and earnings</p>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${isOnline ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-900 hover:bg-gray-300"}`}
            >
              {isOnline ? "🟢 Online" : "⚫ Offline"}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-cyan-500 border-opacity-30 hover:border-opacity-60 transition-all hover:shadow-cyan-500/20 hover:shadow-2xl"
              >
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-blue-200 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Map */}
              <DriverLiveMap fakeRides={fakeRides} />
              {/* Upcoming Rides */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-cyan-500 border-opacity-30">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-cyan-400" />
                  {acceptedRide ? "🚗 Current Ride" : "Available Rides"}
                </h2>

                {acceptedRide ? (
                  <div className="space-y-4">
                    {/* Current Ride */}
                    <div className="p-4 border-2 border-green-400 border-opacity-50 rounded-lg bg-green-400/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {acceptedRide.rider?.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">
                              {acceptedRide.rider?.name}
                            </p>
                            <p className="text-sm text-cyan-300">
                              📍 {acceptedRide.pickupLocation.address}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleCancelRide}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                        >
                          Cancel Ride
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-400">Fare</p>
                          <p className="font-bold text-green-400">
                            ${acceptedRide.fare?.total || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Distance</p>
                          <p className="font-bold text-cyan-300">
                            {acceptedRide.distance || 0} km
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">ETA</p>
                          <p className="font-bold text-blue-300">
                            {acceptedRide.estimatedDuration || 0} min
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
                          <Phone className="h-4 w-4" /> Call Rider
                        </button>
                        <button className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center justify-center gap-2">
                          📍 Route
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isOnline ? (
                  <div className="space-y-3">
                    {availableRides.length > 0 ? (
                      availableRides.map((ride, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border-2 border-cyan-400 border-opacity-30 rounded-lg hover:border-opacity-70 hover:bg-slate-700 hover:bg-opacity-50 transition-all"
                        >
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                {ride.rider?.name?.[0] || "?"}
                              </div>
                              <div>
                                <p className="font-bold text-white">
                                  {ride.rider?.name}
                                </p>
                                <p className="text-sm text-cyan-300">
                                  📱 {ride.rider?.phone}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-blue-100">
                              📍 {ride.pickupLocation?.address}
                            </p>
                            <p className="text-xs text-blue-300">
                              Type: {ride.rideType || "Standard"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400 text-lg">
                              ${ride.fare?.total || 0}
                            </p>
                            <button
                              onClick={() => handleAcceptRide(ride)}
                              className="mt-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all font-medium text-sm shadow-lg"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-blue-200">
                          No rides available right now
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Waiting for ride requests...
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📴</div>
                    <p className="text-blue-200 mb-4">
                      Go online to see ride requests
                    </p>
                    <button
                      onClick={() => setIsOnline(true)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-400 hover:to-green-500 font-bold transition-all shadow-lg"
                    >
                      Go Online Now
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-cyan-500 border-opacity-30">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-cyan-400" />
                  Your Vehicle
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-blue-200">Vehicle Type</p>
                    <p className="font-bold text-cyan-300">Toyota Prius</p>
                  </div>
                  <div>
                    <p className="text-blue-200">License Plate</p>
                    <p className="font-bold text-cyan-300">ABC-1234</p>
                  </div>
                  <div className="pt-3 border-t border-cyan-500 border-opacity-20">
                    <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 font-medium transition-all">
                      Edit Vehicle Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-green-500 border-opacity-30">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Performance
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-blue-200">Acceptance Rate</p>
                      <p className="text-sm font-bold text-green-400">98%</p>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden border border-green-500 border-opacity-20">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: "98%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-blue-200">Completion Rate</p>
                      <p className="text-sm font-bold text-green-400">100%</p>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden border border-green-500 border-opacity-20">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-xl shadow-lg p-6 border border-cyan-400 border-opacity-50">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Need Help?
                </h3>
                <p className="text-sm text-cyan-100 mb-4">
                  Contact our driver support team
                </p>
                <button className="w-full py-2 px-4 bg-white text-cyan-700 rounded-lg hover:bg-cyan-50 font-bold transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fake Ride Modal */}
      {showFakeModal && (
        <FakeRideModal
          ride={showFakeModal}
          onAccept={() => handleAcceptRide(showFakeModal)}
          onDecline={() => handleDeclineRide(showFakeModal)}
          onClose={handleCloseModal}
        />
      )}

      {/* Sound Toggle */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 text-xs p-3 bg-slate-900 text-white rounded-lg border border-cyan-500/50 shadow-lg">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 hover:bg-cyan-500/20 p-1 rounded transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
          <span>{soundEnabled ? "Sound On" : "Sound Off"}</span>
        </button>
      </div>
    </div>
  );
};

export default DriverDashboard;
