// src/pages/RiderTrackingPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RiderLiveMap from '../components/rider/RiderLiveMap';
import MapControls from '../components/map/MapControls';
import { AlertDialog } from '@headlessui/react';

const RiderTrackingPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [activeRide, setActiveRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // ✅ FIX: Use useRef to store mock data to prevent recreation
  const mockRideRef = useRef(null);
  const intervalRef = useRef(null);

  // ✅ FIX: Use setTimeout to avoid setState in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockRide = {
        _id: rideId,
        driver: {
          name: 'Ahmed Khan',
          rating: 4.9,
          phone: '+1 555 987 6543',
          vehicle: {
            model: 'Toyota Prius',
            plate: 'ABC-1234',
            color: 'Silver'
          }
        },
        rider: {
          name: 'You',
          rating: 4.7
        },
        pickupLocation: {
          address: '123 Main St, Downtown',
          coordinates: { lat: 40.7505, lng: -73.9972 }
        },
        dropoffLocation: {
          address: 'Airport Terminal 4',
          coordinates: { lat: 40.6413, lng: -73.7781 }
        },
        fare: { total: 32.50 },
        distance: 12.5,
        estimatedDuration: 25,
        status: 'in_progress'
      };

      mockRideRef.current = mockRide;
      setActiveRide(mockRide);

      setRiderLocation({
        lat: 40.7505,
        lng: -73.9972,
        accuracy: 15,
        timestamp: Date.now()
      });

      // Simulate driver location updates
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setDriverLocation({
          lat: 40.7505 + (Math.random() - 0.5) * 0.01,
          lng: -73.9972 + (Math.random() - 0.5) * 0.01,
          accuracy: 10,
          timestamp: Date.now()
        });
      }, 3000);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rideId]);

  const handleCancel = useCallback(async () => {
    try {
      console.log('Cancelling ride:', rideId);
      navigate('/rider');
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  }, [rideId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Driver is On the Way</h1>
            <p className="text-gray-600 mt-1">Arriving in ~{activeRide?.estimatedDuration} minutes</p>
          </div>
          <button
            onClick={() => setShowCancelDialog(true)}
            className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 font-bold rounded-lg transition-colors"
          >
            Cancel Ride
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-grow relative">
        {activeRide && (
          <RiderLiveMap
            activeRide={activeRide}
            driverLocation={driverLocation}
            riderLocation={riderLocation}
            showTrackingInfo={true}
            onCancel={() => setShowCancelDialog(true)}
          />
        )}

        {/* Map Controls */}
        <MapControls
          onZoomIn={() => console.log('Zoom in')}
          onZoomOut={() => console.log('Zoom out')}
          onCenter={() => console.log('Center')}
          onCall={() => window.location.href = `tel:${activeRide?.driver?.phone}`}
          onMessage={() => console.log('Message')}
          showEmergency={true}
          onEmergency={() => console.log('Emergency')}
        />
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true"></div>

          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Cancel Ride?</h2>
            <p className="text-gray-600">You may be charged a cancellation fee if the driver has already started heading toward you.</p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
              >
                Keep Ride
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
};

export default RiderTrackingPage;