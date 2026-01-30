// src/pages/DriverDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Car, DollarSign, Star, Clock, TrendingUp, Users, MapPin, Phone, Volume2, VolumeX } from 'lucide-react';
import FakeRideModal from '../components/driver/FakeRideModal';
import DriverLiveMap from '../components/driver/DriverLiveMap';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [fakeRides, setFakeRides] = useState([]);
  const [showFakeModal, setShowFakeModal] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentRide, setCurrentRide] = useState(null);

  // Use refs to track state without adding dependencies
  const fakeRideIntervalRef = useRef(null);
  const isOnlineRef = useRef(isOnline);
  const currentRideRef = useRef(currentRide);

  // Update refs when state changes
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    currentRideRef.current = currentRide;
  }, [currentRide]);

  const stats = [
    { icon: Car, label: 'Rides Today', value: '12', color: 'from-blue-500 to-blue-600' },
    { icon: DollarSign, label: 'Earnings Today', value: '$324.50', color: 'from-green-500 to-green-600' },
    { icon: Star, label: 'Rating', value: '4.9★', color: 'from-yellow-500 to-yellow-600' },
    { icon: Clock, label: 'Hours Online', value: '8h 30m', color: 'from-purple-500 to-purple-600' },
  ];

  const upcomingRides = [
    { id: 1, passenger: 'John D.', from: 'Downtown', to: 'Airport', distance: '12 km', fare: '$18.50', rating: '5★' },
    { id: 2, passenger: 'Sarah M.', from: 'Mall', to: 'Office', distance: '8 km', fare: '$12.75', rating: '4.8★' },
    { id: 3, passenger: 'Mike T.', from: 'Hotel', to: 'Restaurant', distance: '5 km', fare: '$8.25', rating: '5★' },
  ];

  // ✅ FIX: Play alert sound with useCallback
  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.warn('Could not play alert sound:', e);
    }
  }, [soundEnabled]);

  // ✅ FIX: Wrap generateFakeRide in useCallback to fix dependency warning
  const generateFakeRide = useCallback(() => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const phones = ['+1-555-0101', '+1-555-0102', '+1-555-0103', '+1-555-0104'];
    const addresses = [
      '123 Main St, New York, NY',
      '456 Oak Ave, Brooklyn, NY',
      '789 Pine Rd, Queens, NY',
      '321 Elm St, Manhattan, NY',
      '654 Maple Dr, Bronx, NY',
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
      rideType: ['Standard', 'Comfort', 'XL'][Math.floor(Math.random() * 3)],
    };

    setFakeRides((prev) => [...prev.slice(-4), newRide]);
    setShowFakeModal(newRide);
    playAlertSound();

    // Auto-close after 8 seconds
    setTimeout(() => {
      setShowFakeModal(null);
    }, 8000);
  }, [playAlertSound]); // ✅ Added playAlertSound as dependency

  // ✅ FIX: Generate fake rides effect - using useCallback prevents infinite loops
  useEffect(() => {
    if (!isOnlineRef.current || currentRideRef.current) {
      if (fakeRideIntervalRef.current) {
        clearInterval(fakeRideIntervalRef.current);
        fakeRideIntervalRef.current = null;
      }
      return;
    }

    // Generate first ride after 1 second
    const initialTimer = setTimeout(() => {
      generateFakeRide();
    }, 1000);

    // Generate rides every 8-15 seconds
    fakeRideIntervalRef.current = setInterval(() => {
      if (isOnlineRef.current && !currentRideRef.current) {
        generateFakeRide();
      }
    }, 8000 + Math.random() * 7000);

    return () => {
      clearTimeout(initialTimer);
      if (fakeRideIntervalRef.current) {
        clearInterval(fakeRideIntervalRef.current);
        fakeRideIntervalRef.current = null;
      }
    };
  }, [generateFakeRide]); // ✅ Now includes generateFakeRide dependency

  // ✅ FIX: Clear fake rides when going offline - avoid setState in effect
  useEffect(() => {
    if (!isOnline) {
      // Use setTimeout to break the synchronous call chain
      const timer = setTimeout(() => {
        setFakeRides([]);
        setShowFakeModal(null);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleAcceptRide = (ride) => {
    if (ride.rideId?.startsWith('fake_')) {
      setFakeRides((prev) => prev.filter((r) => r.rideId !== ride.rideId));
      setCurrentRide(ride);
      setShowFakeModal(null);
    }
  };

  const handleDeclineRide = (ride) => {
    if (ride.rideId?.startsWith('fake_')) {
      setFakeRides((prev) => prev.filter((r) => r.rideId !== ride.rideId));
      setShowFakeModal(null);
    }
  };

  const handleCloseModal = () => {
    setShowFakeModal(null);
  };

  const handleCancelRide = () => {
    setCurrentRide(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Status Toggle */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome, {user?.name}! 👋</h1>
            <p className="text-gray-600">Manage your rides and earnings</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-lg font-medium transition-all ${soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}
              title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
            >
              {soundEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </button>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition-all whitespace-nowrap ${isOnline ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
            >
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Map */}
            <DriverLiveMap fakeRides={fakeRides} />

            {/* Upcoming Rides */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                {currentRide ? '🚗 Current Ride' : 'Upcoming Rides'}
              </h2>

              {currentRide ? (
                <div className="space-y-4">
                  {/* Current Ride */}
                  <div className="p-4 border-2 border-green-400 border-opacity-50 rounded-lg bg-green-400/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {currentRide.rider?.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">
                            {currentRide.rider?.name}
                          </p>
                          <p className="text-sm text-cyan-300">
                            📍 {currentRide.pickupLocation?.address}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCancelRide}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors w-full sm:w-auto"
                      >
                        Cancel Ride
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-300">Fare</p>
                        <p className="font-bold text-green-400">
                          ${currentRide.fare?.total || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">Distance</p>
                        <p className="font-bold text-cyan-300">
                          {currentRide.distance || '12'} km
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">ETA</p>
                        <p className="font-bold text-blue-300">
                          {currentRide.estimatedDuration || '15'} min
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                        <Phone className="h-4 w-4" /> Call Rider
                      </button>
                      <button className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors">
                        📍 Route
                      </button>
                    </div>
                  </div>
                </div>
              ) : isOnline ? (
                <div className="space-y-3">
                  {upcomingRides.length > 0 ? (
                    upcomingRides.map((ride, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all gap-4"
                      >
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
                              {ride.passenger[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {ride.passenger}
                              </p>
                              <p className="text-sm text-gray-600">
                                {ride.rating}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">📍 {ride.from} → {ride.to}</p>
                          <p className="text-xs text-gray-500">{ride.distance}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">{ride.fare}</p>
                          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm w-full sm:w-auto">
                            Accept
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
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
                  <p className="text-gray-600 mb-4">Go online to see ride requests</p>
                  <button
                    onClick={() => setIsOnline(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-colors"
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
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Your Vehicle
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Vehicle Type</p>
                  <p className="font-bold text-gray-900">Toyota Prius</p>
                </div>
                <div>
                  <p className="text-gray-600">License Plate</p>
                  <p className="font-bold text-gray-900">ABC-1234</p>
                </div>
                <div className="pt-3 border-t">
                  <button className="w-full py-2 px-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium transition-colors">
                    Edit Vehicle Details
                  </button>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600">Acceptance Rate</p>
                    <p className="text-sm font-bold text-gray-900">98%</p>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-sm font-bold text-gray-900">100%</p>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Need Help?
              </h3>
              <p className="text-sm text-blue-100 mb-4">Contact our driver support team</p>
              <button className="w-full py-2 px-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-bold transition-colors">
                Contact Support
              </button>
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
          hasActiveRide={!!currentRide}
        />
      )}
    </div>
  );
};

export default DriverDashboard;