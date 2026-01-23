// src/pages/RiderDashboard.jsx
import React, { useState } from "react";
import useAuth from "../hooks/useAuth";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  History,
  Settings,
  Bell,
} from "lucide-react";
import RideBooking from "../components/rider/RideBooking";

const RiderDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("book");

  const stats = [
    {
      icon: MapPin,
      label: "Rides Completed",
      value: "24",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: DollarSign,
      label: "Total Spent",
      value: "$482.50",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Star,
      label: "Rating",
      value: "4.8★",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Clock,
      label: "Hours Used",
      value: "32h 45m",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const recentRides = [
    {
      id: 1,
      route: "Downtown → Airport",
      date: "Today, 10:30 AM",
      fare: "$18.50",
      status: "Completed",
    },
    {
      id: 2,
      route: "Home → Office",
      date: "Yesterday, 8:15 AM",
      fare: "$12.75",
      status: "Completed",
    },
    {
      id: 3,
      route: "Mall → Restaurant",
      date: "Dec 12",
      fare: "$22.00",
      status: "Completed",
    },
  ];

  return (
    <div
      className="min-h-screen py-8"
      style={{
        background:
          "linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)",
        backgroundSize: "400% 400%",
        animation: "animatedGradient 8s ease infinite",
        backgroundAttachment: "fixed",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes animatedGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Floating particles effect */
        .particle {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
        }
        
        .particle1 {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          top: 10%;
          left: 10%;
          animation: float 6s ease-in-out infinite;
        }
        
        .particle2 {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.15);
          top: 70%;
          left: 80%;
          animation: float 8s ease-in-out infinite reverse;
        }
        
        .particle3 {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.05);
          top: 50%;
          left: 50%;
          animation: float 10s ease-in-out infinite;
        }
        
        .particle4 {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          top: 30%;
          left: 70%;
          animation: float 7s ease-in-out infinite reverse;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        
        /* Shimmer effect on cards */
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .rider-dashboard {
          position: relative;
          z-index: 2;
        }
      `}</style>

      {/* Floating particles */}
      <div className="particle particle1"></div>
      <div className="particle particle2"></div>
      <div className="particle particle3"></div>
      <div className="particle particle4"></div>

      <div className="rider-dashboard">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-purple-100">Ready for your next ride?</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="shimmer bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white border-opacity-30 hover:border-opacity-60 hover:bg-opacity-30 transition-all hover:shadow-2xl"
              >
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-purple-100 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-1 shadow-lg border border-white border-opacity-30">
                <button
                  onClick={() => setActiveTab("book")}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${activeTab === "book" ? "bg-white bg-opacity-40 text-white shadow-lg" : "text-purple-100 hover:text-white"}`}
                >
                  Book Ride
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${activeTab === "history" ? "bg-white bg-opacity-40 text-white shadow-lg" : "text-purple-100 hover:text-white"}`}
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${activeTab === "settings" ? "bg-white bg-opacity-40 text-white shadow-lg" : "text-purple-100 hover:text-white"}`}
                >
                  Settings
                </button>
              </div>

              {/* Content */}
              {activeTab === "book" && <RideBooking />}

              {activeTab === "history" && (
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white border-opacity-30">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Recent Rides
                  </h2>
                  <div className="space-y-3">
                    {recentRides.map((ride) => (
                      <div
                        key={ride.id}
                        className="flex items-center justify-between p-4 border border-white border-opacity-30 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      >
                        <div>
                          <p className="font-bold text-white">{ride.route}</p>
                          <p className="text-sm text-purple-100">{ride.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{ride.fare}</p>
                          <p className="text-sm text-green-200 font-medium">
                            {ride.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white border-opacity-30">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border-b border-white border-opacity-20">
                      <div>
                        <p className="font-bold text-white">Notifications</p>
                        <p className="text-sm text-purple-100">
                          Receive ride and promotional alerts
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-6 w-6 text-purple-500 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-white border-opacity-20">
                      <div>
                        <p className="font-bold text-white">Share Location</p>
                        <p className="text-sm text-purple-100">
                          Allow us to track your rides
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-6 w-6 text-purple-500 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="shimmer bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white border-opacity-30">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-200" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full py-3 px-4 bg-white bg-opacity-20 hover:bg-opacity-40 text-white font-bold rounded-lg transition-all">
                    💰 Add Payment Method
                  </button>
                  <button className="w-full py-3 px-4 bg-white bg-opacity-20 hover:bg-opacity-40 text-white font-bold rounded-lg transition-all">
                    ⭐ Rate Last Ride
                  </button>
                  <button className="w-full py-3 px-4 bg-white bg-opacity-20 hover:bg-opacity-40 text-white font-bold rounded-lg transition-all">
                    👥 Refer a Friend
                  </button>
                </div>
              </div>

              {/* Promo Card */}
              <div className="bg-gradient-to-br from-white to-purple-100 text-gray-900 rounded-xl shadow-lg p-6 border border-white border-opacity-50">
                <h3 className="font-bold text-lg mb-2">Special Offer!</h3>
                <p className="text-sm mb-4 text-gray-700">
                  Get $5 off on your next 3 rides
                </p>
                <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                  Use Code: VC2024
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
