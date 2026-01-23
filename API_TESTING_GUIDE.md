# VeloCity API Examples & Testing Guide

## Complete Example: Ride Request to Completion

### Example 1: Basic Ride Request Flow (cURL)

#### 1. Rider Requests a Ride

```bash
curl -X POST http://localhost:5000/api/rides/request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": {
      "address": "123 Main Street, New York, NY",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "dropoffLocation": {
      "address": "456 Broadway, New York, NY",
      "coordinates": {
        "lat": 40.7614,
        "lng": -73.9776
      }
    },
    "rideType": "standard"
  }'

# Response:
{
  "success": true,
  "data": {
    "ride": {
      "_id": "ride_123",
      "rider": "user_456",
      "status": "requested",
      "pickupLocation": { "address": "123 Main Street, New York, NY", "coordinates": {"lat": 40.7128, "lng": -74.0060} },
      "dropoffLocation": { "address": "456 Broadway, New York, NY", "coordinates": {"lat": 40.7614, "lng": -73.9776} },
      "fare": {
        "baseFare": 5,
        "distanceFare": 10.4,
        "timeFare": 3,
        "total": 18.4,
        "currency": "USD"
      },
      "distance": 5.2,
      "estimatedDuration": 12,
      "rideType": "standard",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### 2. Driver Receives & Accepts Ride

```bash
# Driver sees available rides
curl -X GET http://localhost:5000/api/rides/available/list \
  -H "Authorization: Bearer DRIVER_JWT_TOKEN"

# Response shows ride from step 1

# Driver accepts the ride
curl -X POST http://localhost:5000/api/rides/ride_123/accept \
  -H "Authorization: Bearer DRIVER_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Response:
{
  "success": true,
  "message": "Ride accepted",
  "data": {
    "rideId": "ride_123",
    "status": "accepted",
    "driver": {
      "_id": "driver_789",
      "name": "John Smith",
      "rating": 4.8,
      "phone": "+1234567890"
    },
    "estimatedArrival": 8  # minutes
  }
}
```

#### 3. Driver Marks Arrival

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/arrived \
  -H "Authorization: Bearer DRIVER_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Response:
{
  "success": true,
  "message": "Driver arrival marked",
  "data": {
    "rideId": "ride_123",
    "status": "driver_arrived",
    "arrivedAt": "2024-01-15T10:38:00Z"
  }
}
```

#### 4. Driver Sends OTP to Rider

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/start \
  -H "Authorization: Bearer DRIVER_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Response:
{
  "success": true,
  "message": "OTP sent to rider",
  "data": {
    "rideId": "ride_123",
    "status": "otp_pending"
  }
}

# OTP is sent to rider's phone via SMS: "Your VeloCity OTP is: 456789"
```

#### 5. Rider Verifies OTP

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/verify-otp \
  -H "Authorization: Bearer RIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "456789",
    "verifiedBy": "driver"
  }'

# Response:
{
  "success": true,
  "message": "OTP verified. Ride started.",
  "data": {
    "rideId": "ride_123",
    "status": "in_progress",
    "startedAt": "2024-01-15T10:39:00Z"
  }
}
```

#### 6. Real-Time Location Updates (every 5 seconds)

```bash
# Rider updates location (continuous)
curl -X POST http://localhost:5000/api/rides/ride_123/location \
  -H "Authorization: Bearer RIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 40.7200,
    "lng": -74.0100,
    "address": "Park Avenue, New York"
  }'

# Driver updates location (continuous)
curl -X POST http://localhost:5000/api/rides/ride_123/location \
  -H "Authorization: Bearer DRIVER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 40.7614,
    "lng": -73.9776,
    "address": "Broadway, New York"
  }'
```

#### 7. Driver Completes the Ride

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/complete \
  -H "Authorization: Bearer DRIVER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actualDuration": 11,
    "endLocationLat": 40.7614,
    "endLocationLng": -73.9776
  }'

# Response:
{
  "success": true,
  "message": "Ride completed successfully",
  "data": {
    "rideId": "ride_123",
    "status": "completed",
    "completedAt": "2024-01-15T10:50:00Z",
    "fare": {
      "baseFare": 5,
      "distanceFare": 10.40,
      "timeFare": 2.75,
      "total": 18.15,
      "surgeMultiplier": 1.0
    },
    "distance": 5.2,
    "actualDuration": 11
  }
}
```

#### 8. Rider Rates the Driver

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/rate \
  -H "Authorization: Bearer RIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent driver, very friendly!",
    "feedback": {
      "vehicleCondition": 2,
      "driverBehavior": 2,
      "safetyRating": 2
    }
  }'

# Response:
{
  "success": true,
  "message": "Rating saved successfully",
  "data": {
    "rideId": "ride_123",
    "rating": 5,
    "comment": "Excellent driver, very friendly!"
  }
}
```

#### 9. Driver Rates the Rider

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/rate \
  -H "Authorization: Bearer DRIVER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Great passenger!",
    "feedback": {
      "riderBehavior": 2,
      "cleanliness": 2
    }
  }'
```

#### 10. Get Ride Details

```bash
curl -X GET http://localhost:5000/api/rides/ride_123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
{
  "success": true,
  "data": {
    "ride": {
      "_id": "ride_123",
      "rider": { "_id": "user_456", "name": "Sarah", "rating": 4.9 },
      "driver": { "_id": "driver_789", "name": "John Smith", "rating": 4.85 },
      "status": "completed",
      "pickupLocation": { ... },
      "dropoffLocation": { ... },
      "fare": { "total": 18.15, ... },
      "distance": 5.2,
      "estimatedDuration": 12,
      "actualDuration": 11,
      "rating": {
        "byRider": { "rating": 5, "comment": "Excellent driver..." },
        "byDriver": { "rating": 5, "comment": "Great passenger!" }
      },
      "requestedAt": "2024-01-15T10:30:00Z",
      "acceptedAt": "2024-01-15T10:32:00Z",
      "arrivedAt": "2024-01-15T10:38:00Z",
      "startedAt": "2024-01-15T10:39:00Z",
      "completedAt": "2024-01-15T10:50:00Z"
    }
  }
}
```

#### 11. Get Ride History

```bash
curl -X GET "http://localhost:5000/api/rides/history/all?page=1&limit=10&status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
{
  "success": true,
  "data": {
    "rides": [
      {
        "_id": "ride_123",
        "driver": { "name": "John Smith", "rating": 4.85 },
        "distance": 5.2,
        "fare": { "total": 18.15 },
        "completedAt": "2024-01-15T10:50:00Z",
        "rating": { "byRider": { "rating": 5 } }
      },
      // ... more rides
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

## Example 2: Cancellation Flow

### Rider Cancels Before Driver Accepts

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/cancel \
  -H "Authorization: Bearer RIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Changed my destination"
  }'

# Response:
{
  "success": true,
  "message": "Ride cancelled",
  "data": {
    "rideId": "ride_123",
    "status": "cancelled",
    "cancelledBy": "rider",
    "reason": "Changed my destination",
    "cancellationPenalty": 0  # No penalty before driver accepted
  }
}
```

### Driver Cancels After Accepting

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/cancel \
  -H "Authorization: Bearer DRIVER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Emergency at home"
  }'

# Response:
{
  "success": true,
  "message": "Ride cancelled",
  "data": {
    "rideId": "ride_123",
    "status": "cancelled",
    "cancelledBy": "driver",
    "reason": "Emergency at home",
    "cancellationPenalty": 1.25  # 25% of base fare
  }
}
```

## Example 3: Error Scenarios

### Invalid OTP

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/verify-otp \
  -H "Authorization: Bearer RIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "000000"}'

# Response (400):
{
  "success": false,
  "error": "Invalid or expired OTP"
}
```

### Unauthorized Ride Access

```bash
curl -X GET http://localhost:5000/api/rides/ride_123 \
  -H "Authorization: Bearer OTHER_USER_JWT_TOKEN"

# Response (403):
{
  "success": false,
  "error": "Unauthorized"
}
```

### Cannot Rate Without Completion

```bash
curl -X POST http://localhost:5000/api/rides/ride_456/rate \
  -H "Authorization: Bearer RIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'

# Response (400):
{
  "success": false,
  "error": "Can only rate completed rides"
}
```

### Already Rated

```bash
curl -X POST http://localhost:5000/api/rides/ride_123/rate \
  -H "Authorization: Bearer RIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4}'

# Response (400):
{
  "success": false,
  "error": "You have already rated this ride"
}
```

## WebSocket Event Examples

### Browser Console Testing

#### Connect & Setup

```javascript
// This is automatic when using useWebSocket hook
const socket = io("http://localhost:5000", {
  auth: { token: "YOUR_JWT_TOKEN" },
});

socket.on("connect", () => {
  console.log("Connected to server");
});
```

#### Listen for New Ride Request (Driver)

```javascript
socket.on("new_ride_request", (data) => {
  console.log("New ride:", {
    rideId: data.rideId,
    rider: data.ride.riderName,
    pickup: data.ride.pickupAddress,
    dropoff: data.ride.dropoffAddress,
    fare: data.ride.fare.total,
    distance: data.ride.distance + " km",
  });
});
```

#### Listen for Ride Acceptance (Rider)

```javascript
socket.on("ride_accepted", (data) => {
  console.log("Driver accepted!", {
    driverName: data.ride.driver.name,
    driverRating: data.ride.driver.rating,
    estimatedArrival:
      "in " + Math.round((data.driver.distanceFromPickup / 40) * 60) + " mins",
  });
});
```

#### Accept a Ride (Driver)

```javascript
socket.emit("accept_ride", {
  rideId: "ride_123",
  driverId: "driver_789",
});
```

#### Send Location Update

```javascript
socket.emit("update_location", {
  userId: "driver_789",
  location: { lat: 40.7128, lng: -74.006 },
  rideId: "ride_123",
});
```

#### Update Ride Status

```javascript
socket.emit("update_ride_status", {
  rideId: "ride_123",
  status: "in_progress",
});
```

## Postman Collection Example

### Create in Postman:

**Collection:** VeloCity API

**Requests:**

1. **Request Ride**
   - Method: POST
   - URL: `{{base_url}}/api/rides/request`
   - Headers: `Authorization: Bearer {{token}}`
   - Body (JSON): See Example 1, Step 1

2. **Get Available Rides**
   - Method: GET
   - URL: `{{base_url}}/api/rides/available/list`
   - Headers: `Authorization: Bearer {{driver_token}}`

3. **Accept Ride**
   - Method: POST
   - URL: `{{base_url}}/api/rides/:rideId/accept`
   - Headers: `Authorization: Bearer {{driver_token}}`

4. **Complete Ride**
   - Method: POST
   - URL: `{{base_url}}/api/rides/:rideId/complete`
   - Headers: `Authorization: Bearer {{driver_token}}`
   - Body: See Example 1, Step 7

5. **Get Ride History**
   - Method: GET
   - URL: `{{base_url}}/api/rides/history/all?page=1&limit=10`
   - Headers: `Authorization: Bearer {{token}}`

### Environment Variables in Postman:

```json
{
  "base_url": "http://localhost:5000/api",
  "token": "your_jwt_token_here",
  "driver_token": "driver_jwt_token_here",
  "rideId": "ride_123"
}
```

## Testing Checklist with cURL

```bash
# 1. Request ride as rider
curl -X POST http://localhost:5000/api/rides/request \
  -H "Authorization: Bearer {{rider_token}}" \
  -H "Content-Type: application/json" \
  -d '{"pickupLocation":{...},"dropoffLocation":{...},"rideType":"standard"}'

# 2. Get available rides as driver
curl -X GET http://localhost:5000/api/rides/available/list \
  -H "Authorization: Bearer {{driver_token}}"

# 3. Accept ride as driver
curl -X POST http://localhost:5000/api/rides/{{rideId}}/accept \
  -H "Authorization: Bearer {{driver_token}}"

# 4. Mark arrived
curl -X POST http://localhost:5000/api/rides/{{rideId}}/arrived \
  -H "Authorization: Bearer {{driver_token}}"

# 5. Start ride (generate OTP)
curl -X POST http://localhost:5000/api/rides/{{rideId}}/start \
  -H "Authorization: Bearer {{driver_token}}"

# 6. Verify OTP as rider
curl -X POST http://localhost:5000/api/rides/{{rideId}}/verify-otp \
  -H "Authorization: Bearer {{rider_token}}" \
  -H "Content-Type: application/json" \
  -d '{"otp":"456789"}'

# 7. Complete ride as driver
curl -X POST http://localhost:5000/api/rides/{{rideId}}/complete \
  -H "Authorization: Bearer {{driver_token}}" \
  -H "Content-Type: application/json" \
  -d '{"actualDuration":11,"endLocationLat":40.7614,"endLocationLng":-73.9776}'

# 8. Rate driver as rider
curl -X POST http://localhost:5000/api/rides/{{rideId}}/rate \
  -H "Authorization: Bearer {{rider_token}}" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Great!"}'

# 9. Get ride history
curl -X GET "http://localhost:5000/api/rides/history/all?page=1&limit=10" \
  -H "Authorization: Bearer {{rider_token}}"
```

This provides a complete walkthrough of the entire system from booking to completion!
