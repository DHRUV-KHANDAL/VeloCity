import React, { useState, useEffect } from "react";
import { X, MapPin, Star, Phone, Clock } from "lucide-react";
import MapComponent from "../common/MapComponent";

const NearbyDriversModal = ({
  isOpen,
  onClose,
  drivers,
  pickupLocation,
  rideData,
}) => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [mapCenter, setMapCenter] = useState(pickupLocation?.coordinates);

  useEffect(() => {
    if (pickupLocation?.coordinates) {
      setMapCenter(pickupLocation.coordinates);
    }
  }, [pickupLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
            <div>
              <h2 className="text-xl font-bold">Available Drivers Nearby</h2>
              <p className="text-sm text-blue-100">
                {drivers?.length || 0} drivers found within 5 km
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-white hover:bg-opacity-20 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
              {/* Map Section */}
              <div className="lg:col-span-2">
                <div className="rounded-xl overflow-hidden shadow-lg h-96 bg-gray-100">
                  {mapCenter && (
                    <MapComponent
                      center={mapCenter}
                      markers={[
                        {
                          lat: mapCenter.lat,
                          lng: mapCenter.lng,
                          label: "Your Location",
                          color: "blue",
                        },
                        ...(drivers || []).map((driver, idx) => ({
                          lat:
                            driver.location?.coordinates?.lat || mapCenter.lat,
                          lng:
                            driver.location?.coordinates?.lng || mapCenter.lng,
                          label: driver.name,
                          color: "green",
                        })),
                      ]}
                    />
                  )}
                </div>
              </div>

              {/* Drivers List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Select Driver</h3>
                {drivers && drivers.length > 0 ? (
                  drivers.slice(0, 6).map((driver) => (
                    <div
                      key={driver._id}
                      onClick={() => setSelectedDriver(driver._id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDriver === driver._id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {driver.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {driver.vehicle?.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold">
                            {driver.rating || 4.8}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            ETA: {Math.floor(Math.random() * 5) + 2} min
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{driver.vehicle?.number}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No drivers available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedDriver) {
                    console.log("Driver selected:", selectedDriver);
                    onClose();
                  }
                }}
                disabled={!selectedDriver}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm Driver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyDriversModal;
