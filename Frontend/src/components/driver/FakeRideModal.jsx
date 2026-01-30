// src/components/driver/FakeRideModal.jsx
import React from "react";
import { X, MapPin, Clock, DollarSign, User, Phone } from "lucide-react";

const FakeRideModal = ({ ride, onAccept, onDecline, onClose, hasActiveRide = false }) => {
  if (!ride) return null;

  // ✅ Conditional classes based on active ride status
  const overlayClasses = hasActiveRide 
    ? "fixed bottom-4 right-4 z-40" // ✅ Side panel when riding
    : "fixed inset-0 z-50 flex items-center justify-center"; // ✅ Full screen when idle

  const modalClasses = hasActiveRide
    ? "bg-white rounded-xl shadow-2xl max-w-sm w-96 transform transition-all animate-slide-in-right"
    : "bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-slide-up";

  const overlayBg = hasActiveRide
    ? "" // ✅ No background overlay on side
    : "bg-black bg-opacity-60 backdrop-blur-sm"; // ✅ Dark overlay when full screen

  return (
    <div className={`${overlayClasses} ${overlayBg}`}>
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }

        .pulse-ring {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className={modalClasses}>
        {/* Header */}
        <div className={`${hasActiveRide ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600'} text-white p-4 rounded-t-xl flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`${hasActiveRide ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-white bg-opacity-20 flex items-center justify-center animate-pulse`}>
              <User className={`${hasActiveRide ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
            </div>
            <div>
              <p className={`font-bold ${hasActiveRide ? 'text-sm' : 'text-lg'}`}>New Ride Request</p>
              <p className={`${hasActiveRide ? 'text-xs' : 'text-sm'} opacity-90`}>Near your location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
          >
            <X className={hasActiveRide ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>
        </div>

        {/* Body */}
        <div className={`p-${hasActiveRide ? '4' : '6'} space-y-${hasActiveRide ? '3' : '4'}`}>
          {/* Passenger Info */}
          <div className={`flex items-center gap-3 pb-${hasActiveRide ? '3' : '4'} border-b border-gray-200`}>
            <div className={`${hasActiveRide ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold`}>
              {ride.rider?.name?.[0] || "?"}
            </div>
            <div className="flex-grow">
              <p className={`font-bold text-gray-900 ${hasActiveRide ? 'text-sm' : 'text-lg'}`}>
                {ride.rider?.name || "Rider"}
              </p>
              <p className={`text-gray-600 ${hasActiveRide ? 'text-xs' : 'text-sm'}`}>
                {ride.rider?.phone || "Phone hidden"}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className={`space-y-${hasActiveRide ? '2' : '3'}`}>
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <MapPin className={`h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0 ${hasActiveRide ? 'h-4 w-4' : ''}`} />
              <div>
                <p className={`font-medium text-gray-900 ${hasActiveRide ? 'text-xs' : 'text-sm'}`}>Pickup</p>
                <p className={`text-gray-600 ${hasActiveRide ? 'text-xs' : 'text-sm'}`}>
                  {ride.pickupLocation?.address || "Address not provided"}
                </p>
              </div>
            </div>

            {/* ETA */}
            <div className="flex items-start gap-3">
              <Clock className={`h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0 ${hasActiveRide ? 'h-4 w-4' : ''}`} />
              <div>
                <p className={`font-medium text-gray-900 ${hasActiveRide ? 'text-xs' : 'text-sm'}`}>ETA</p>
                <p className={`text-gray-600 ${hasActiveRide ? 'text-xs' : 'text-sm'}`}>
                  {ride.estimatedDuration || 5} min
                </p>
              </div>
            </div>

            {/* Fare */}
            <div className="flex items-start gap-3">
              <DollarSign className={`h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0 ${hasActiveRide ? 'h-4 w-4' : ''}`} />
              <div>
                <p className={`font-medium text-gray-900 ${hasActiveRide ? 'text-xs' : 'text-sm'}`}>Fare</p>
                <p className={`font-bold text-green-600 ${hasActiveRide ? 'text-sm' : 'text-lg'}`}>
                  ${ride.fare?.total || "12.50"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`bg-gray-50 px-${hasActiveRide ? '4' : '6'} py-${hasActiveRide ? '3' : '4'} rounded-b-xl flex gap-${hasActiveRide ? '2' : '3'}`}>
          <button
            onClick={onDecline}
            className={`flex-1 py-${hasActiveRide ? '2' : '3'} px-${hasActiveRide ? '3' : '4'} bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors ${hasActiveRide ? 'text-xs' : 'text-sm'}`}
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className={`flex-1 py-${hasActiveRide ? '2' : '3'} px-${hasActiveRide ? '3' : '4'} bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-400 hover:to-green-500 transition-all font-medium shadow-md ${hasActiveRide ? 'text-xs' : 'text-sm'}`}
          >
            Accept Ride
          </button>
        </div>

        {/* Pulsing indicator when active ride */}
        {hasActiveRide && (
          <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full pulse-ring"></div>
        )}
      </div>
    </div>
  );
};

export default FakeRideModal;