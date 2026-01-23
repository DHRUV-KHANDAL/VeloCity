// src/components/driver/FakeRideModal.jsx
import React from "react";
import { X, MapPin, Clock, DollarSign, User } from "lucide-react";

const FakeRideModal = ({ ride, onAccept, onDecline, onClose }) => {
  if (!ride) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">New Ride Request</p>
              <p className="text-sm opacity-90">Near your location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="bg-cyan-100 text-cyan-600 rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg">
              {ride.rider?.name?.[0] || "?"}
            </div>
            <div className="flex-grow">
              <p className="font-bold text-gray-900 text-lg">
                {ride.rider?.name || "Rider"}
              </p>
              <p className="text-sm text-gray-600">
                {ride.rider?.phone || "Phone hidden"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pickup</p>
                <p className="text-sm text-gray-600">
                  {ride.pickupLocation?.address || "Address not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">ETA</p>
                <p className="text-sm text-gray-600">
                  {ride.estimatedDuration || 5} min
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Fare</p>
                <p className="text-lg font-bold text-green-600">
                  ${ride.fare?.total || "12.50"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-400 hover:to-green-500 font-medium transition-all shadow-md"
          >
            Accept Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default FakeRideModal;
