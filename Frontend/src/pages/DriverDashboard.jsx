// src/pages/DriverDashboard.jsx - UPDATED SECTION
import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Car, DollarSign, Star, Clock, TrendingUp, MapPin } from 'lucide-react';
import DriverMapWrapper from '../components/driver/DriverMapWrapper';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [acceptedRide, setAcceptedRide] = useState(null);

  const handleLocationUpdate = useCallback((location) => {
    // Send location to backend via WebSocket
    console.log('Location updated:', location);
  }, []);

  const stats = [
    { icon: Car, label: 'Rides Today', value: '12', color: 'from-blue-500 to-blue-600' },
    { icon: DollarSign, label: 'Earnings Today', value: '$324.50', color: 'from-green-500 to-green-600' },
    { icon: Star, label: 'Rating', value: '4.9★', color: 'from-yellow-500 to-yellow-600' },
    { icon: Clock, label: 'Hours Online', value: '8h 30m', color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Status Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user?.name}! 👋</h1>
            <p className="text-gray-600">Manage your rides and earnings</p>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${isOnline ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
          >
            {isOnline ? '🟢 Online' : '⚫ Offline'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6">
              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Map - Takes Full Width */}
          <div className="lg:col-span-2 h-96">
            <DriverMapWrapper 
              acceptedRide={acceptedRide}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vehicle Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
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

            {/* Quick Start */}
            {!acceptedRide && (
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-3">Ready to Accept Rides?</h3>
                <p className="text-sm text-blue-100 mb-4">Accept ride requests to start earning money</p>
                <button
                  onClick={() => setIsOnline(true)}
                  className="w-full py-2 px-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-bold transition-colors"
                >
                  Go Online
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;