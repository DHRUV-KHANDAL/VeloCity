// src/services/fakeRideService.js

const RIDER_NAMES = [
  'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 
  'Eve Wilson', 'Frank Miller', 'Grace Lee', 'Henry Davis',
  'Ivy Martinez', 'Jack Wilson', 'Kate Anderson', 'Leo Chen',
  'Maria Garcia', 'Noah Taylor', 'Olivia White', 'Paul Harris'
];

const PHONE_NUMBERS = [
  '+1-555-0101', '+1-555-0102', '+1-555-0103', '+1-555-0104',
  '+1-555-0105', '+1-555-0106', '+1-555-0107', '+1-555-0108'
];

const PICKUP_LOCATIONS = [
  { address: '123 Main St, Downtown', lat: 40.7505, lng: -73.9972 },
  { address: '456 Oak Ave, Brooklyn', lat: 40.6501, lng: -73.9496 },
  { address: '789 Pine Rd, Queens', lat: 40.7282, lng: -73.7949 },
  { address: '321 Elm St, Manhattan', lat: 40.7614, lng: -73.9776 },
  { address: '654 Maple Dr, Bronx', lat: 40.8448, lng: -73.8648 },
  { address: '987 Cedar Lane, Staten Island', lat: 40.5757, lng: -74.1502 },
  { address: '111 Park Ave, Upper West', lat: 40.7851, lng: -73.9745 },
  { address: '222 5th Ave, Midtown', lat: 40.7580, lng: -73.9855 }
];

const DROPOFF_LOCATIONS = [
  { address: 'JFK Airport Terminal 4', lat: 40.6413, lng: -73.7781 },
  { address: 'Grand Central Terminal', lat: 40.7527, lng: -73.9772 },
  { address: 'Times Square', lat: 40.7580, lng: -73.9855 },
  { address: 'Central Park', lat: 40.7829, lng: -73.9654 },
  { address: 'Brooklyn Bridge Park', lat: 40.7014, lng: -73.9934 },
  { address: 'High Line Park', lat: 40.7505, lng: -74.0021 },
  { address: 'Rockefeller Center', lat: 40.7587, lng: -73.9787 },
  { address: 'Empire State Building', lat: 40.7484, lng: -73.9857 },
  { address: 'Statue of Liberty', lat: 40.6892, lng: -74.0445 },
  { address: 'Madison Square Garden', lat: 40.7505, lng: -73.9934 }
];

const RIDE_TYPES = ['Standard', 'Comfort', 'Premium'];

class FakeRideService {
  generateFakeRide() {
    const randomRider = RIDER_NAMES[Math.floor(Math.random() * RIDER_NAMES.length)];
    const randomPhone = PHONE_NUMBERS[Math.floor(Math.random() * PHONE_NUMBERS.length)];
    const randomPickup = PICKUP_LOCATIONS[Math.floor(Math.random() * PICKUP_LOCATIONS.length)];
    const randomDropoff = DROPOFF_LOCATIONS[Math.floor(Math.random() * DROPOFF_LOCATIONS.length)];

    const distance = Math.random() * 15 + 2;
    const estimatedDuration = Math.floor(distance / 0.5);
    const fare = (12 + Math.random() * 20).toFixed(2);
    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    const rideType = RIDE_TYPES[Math.floor(Math.random() * RIDE_TYPES.length)];

    return {
      id: `ride_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      rideId: `fake_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      rider: {
        name: randomRider,
        phone: randomPhone,
        id: Math.random().toString(36).substr(2, 9)
      },
      pickupLocation: {
        address: randomPickup.address,
        coordinates: {
          lat: randomPickup.lat + (Math.random() - 0.5) * 0.05,
          lng: randomPickup.lng + (Math.random() - 0.5) * 0.05
        }
      },
      dropoffLocation: {
        address: randomDropoff.address,
        coordinates: {
          lat: randomDropoff.lat + (Math.random() - 0.5) * 0.05,
          lng: randomDropoff.lng + (Math.random() - 0.5) * 0.05
        }
      },
      fare: {
        total: fare,
        baseFare: '2.50',
        distanceFare: (distance * 1.5).toFixed(2),
        timeFare: (estimatedDuration * 0.3).toFixed(2)
      },
      estimatedDuration,
      distance: distance.toFixed(1),
      rideType,
      rating: rating + '★',
      status: 'pending',
      createdAt: Date.now()
    };
  }

  generateMultipleRides(count = 5) {
    return Array.from({ length: count }, () => this.generateFakeRide());
  }
}

export default new FakeRideService();