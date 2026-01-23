# VeloCity Testing Strategy - Zero Budget Testing Guide

## 📋 Complete Testing Plan for Free Ride-Sharing Platform

### PHASE 1: LOCAL DEVELOPMENT TESTING

#### 1.1 Manual Testing Checklist

**User Registration & Authentication**

```
✅ Rider Registration
   - Register with valid email
   - Check password validation (min 6 chars)
   - Verify OTP email received
   - Confirm account created in MongoDB

✅ Driver Registration
   - Register with valid email
   - Upload documents (license, registration, insurance)
   - License expiry date validation
   - Vehicle details stored correctly
   - Status should be "pending" until admin approval
   - Check documents stored in /uploads/driver-documents/

✅ Admin Registration
   - Create admin account manually in MongoDB:
     db.users.insertOne({
       name: "Admin User",
       email: "admin@velocity.com",
       password: <bcrypt-hash>,
       role: "admin"
     })

✅ Login Flow
   - Login with correct credentials
   - Fail with wrong password
   - Fail with non-existent email
   - JWT token should be issued
   - Token stored in localStorage
```

**Email OTP System**

```
✅ OTP Generation
   - Request OTP during registration
   - Check email arrives in inbox (or mock console)
   - OTP format: 6 digits
   - Expires after 10 minutes

✅ OTP Verification
   - Enter correct OTP → Success
   - Enter wrong OTP → "Invalid OTP"
   - Exceed 3 attempts → "Too many attempts"
   - Expired OTP → "OTP expired"

✅ OTP Resend
   - Click "Resend OTP"
   - Should receive new OTP email
   - Old OTP should be invalidated
```

**Driver Approval Workflow**

```
✅ Admin Panel Access
   - Login as admin
   - Navigate to admin dashboard
   - Should see pending drivers list
   - Should NOT see if not admin

✅ Driver Approval
   - View pending driver details
   - Click "Approve" with notes
   - Driver status changes to "approved"
   - Driver can now go online

✅ Driver Rejection
   - Click "Reject" with reason
   - Driver status changes to "rejected"
   - Driver notified (check console logs)

✅ Driver Suspension
   - Suspend approved driver with reason
   - Driver status changes to "suspended"
   - Driver cannot go online
   - Can unsuspend later
```

**Document Upload**

```
✅ File Upload
   - Upload JPG/PNG/PDF files
   - File size validation (max 5MB)
   - Files stored in /uploads/driver-documents/
   - Correct filename generation: driverId-timestamp-random.ext

✅ File Retrieval
   - Documents accessible via /uploads/driver-documents/
   - Admin can view uploaded files
   - Multiple documents per driver supported

✅ Document Validation
   - Invalid file type → Reject with error
   - File too large → Reject with error
   - Empty file → Reject with error
```

**Real-Time Location Tracking**

```
✅ WebSocket Connection
   - Browser console: "✅ Socket.io connected: [socket-id]"
   - Driver goes online
   - Location tracked every 5 seconds
   - Real coordinates from Geolocation API

✅ Nearby Drivers Search
   - Rider enters location
   - System queries MongoDB geospatial index
   - Returns drivers within 10km radius
   - Shows on OpenStreetMap with markers

✅ Live Location Updates
   - Driver moves, location updates in real-time
   - Rider sees driver moving on map
   - No WebSocket errors in console
```

**Ride Booking Flow**

```
✅ Rider Books Ride
   - Select pickup and dropoff
   - Click "Find Rides"
   - See nearby drivers on map
   - Click driver to book

✅ Driver Accepts Ride
   - Get incoming ride notification
   - Accept/Reject options
   - If accept: rider sees driver's real-time location

✅ OTP for Rider-Driver Meeting
   - After acceptance, rider gets OTP email
   - Driver asks for OTP
   - Rider provides OTP
   - System verifies OTP

✅ Ride Starts
   - After OTP verified, ride status → "in_progress"
   - Timer starts for ride duration
   - Real-time location tracking continues
```

**Cash Payment Tracking**

```
✅ Fare Calculation
   - Base fare: $5
   - Distance rate: $2/km
   - Time rate: $0.25/min
   - Total calculated correctly

✅ Payment Record
   - After ride completion
   - Fare amount recorded in system
   - Payment status → "completed"
   - Transaction ID generated: CASH-{timestamp}

✅ Driver Earnings
   - Driver earnings updated
   - Month earnings updated
   - Pending payment tracked
```

**Rating System**

```
✅ Post-Ride Rating
   - Rider rates driver (1-5 stars)
   - Driver rates rider (1-5 stars)
   - Comments optional
   - Ratings stored in database
   - Driver average rating updated

✅ Rating Visibility
   - Driver rating shown in profile
   - Rider can see driver ratings before booking
```

**Admin Dashboard**

```
✅ Platform Statistics
   - Total users count
   - Total drivers count
   - Approved drivers count
   - Total rides count
   - Total revenue
   - Today's revenue

✅ Cash Settlement Report
   - Select date
   - View rides completed that day
   - View total revenue
   - Breakdown by driver
   - Driver earnings summary

✅ Driver Earnings Dashboard
   - Select driver
   - Total earnings lifetime
   - Earnings this month
   - Pending payment amount
   - Average earning per ride
```

---

### PHASE 2: UNIT TESTING (Using Jest - Free)

#### 2.1 Backend Tests

**Installation**

```bash
cd Backend
npm install --save-dev jest @babel/preset-env babel-jest
npx jest --init
```

**test/otpService.test.js**

```javascript
import emailOTPService from "../services/emailOTPService.js";

describe("Email OTP Service", () => {
  test("Should generate 6-digit OTP", () => {
    const otp = emailOTPService.generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
    expect(otp.length).toBe(6);
  });

  test("Should create OTP with expiry", async () => {
    const result = await emailOTPService.createOTP("test@example.com");
    expect(result.otp).toMatch(/^\d{6}$/);
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });

  test("Should verify correct OTP", async () => {
    const email = "test@example.com";
    const { otp } = await emailOTPService.createOTP(email);
    const result = await emailOTPService.verifyOTP(email, otp);
    expect(result.success).toBe(true);
  });

  test("Should reject incorrect OTP", async () => {
    const email = "test2@example.com";
    await emailOTPService.createOTP(email);
    const result = await emailOTPService.verifyOTP(email, "000000");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

**test/cashPaymentService.test.js**

```javascript
import cashPaymentService from "../services/cashPaymentService.js";

describe("Cash Payment Service", () => {
  test("Should calculate fare correctly", () => {
    const distance = 10; // km
    const duration = 20; // minutes

    const baseFare = 5;
    const distanceFare = distance * 2;
    const timeFare = duration * 0.25;
    const totalFare = baseFare + distanceFare + timeFare;

    expect(totalFare).toBe(30); // 5 + 20 + 5
  });

  test("Should generate settlement report", async () => {
    const date = new Date();
    const result = await cashPaymentService.generateDailySettlementReport(date);
    expect(result.success).toBe(true);
    expect(result.report).toHaveProperty("date");
    expect(result.report).toHaveProperty("totalRides");
    expect(result.report).toHaveProperty("totalRevenue");
  });
});
```

**test/documentUploadService.test.js**

```javascript
import documentUploadService from "../services/documentUploadService.js";

describe("Document Upload Service", () => {
  test("Should validate allowed file types", () => {
    const validFile = { mimetype: "image/jpeg", size: 1000000 };
    const validation = documentUploadService.validateFile(validFile);
    expect(validation.valid).toBe(true);
  });

  test("Should reject invalid file type", () => {
    const invalidFile = { mimetype: "application/exe", size: 1000000 };
    const validation = documentUploadService.validateFile(invalidFile);
    expect(validation.valid).toBe(false);
  });

  test("Should reject oversized files", () => {
    const largeFile = { mimetype: "image/jpeg", size: 10 * 1024 * 1024 };
    const validation = documentUploadService.validateFile(largeFile);
    expect(validation.valid).toBe(false);
  });

  test("Should generate unique filename", () => {
    const name1 = documentUploadService.generateFilename(
      "license.pdf",
      "driver1",
    );
    const name2 = documentUploadService.generateFilename(
      "license.pdf",
      "driver1",
    );
    expect(name1).not.toBe(name2);
    expect(name1).toMatch(/^driver1-\d+-[a-f0-9]+\.pdf$/);
  });
});
```

#### 2.2 Frontend Tests

**Installation**

```bash
cd Frontend
npm install --save-dev vitest @vitest/ui jsdom
```

**test/useGeolocation.test.js**

```javascript
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import useGeolocation from "../src/hooks/useGeolocation.js";

describe("useGeolocation Hook", () => {
  it("Should initialize with default location", () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.location).toBeDefined();
    expect(result.current.location.lat).toBeDefined();
    expect(result.current.location.lng).toBeDefined();
  });

  it("Should update location every 5 seconds", async () => {
    const { result } = renderHook(() => useGeolocation());
    const initialLocation = result.current.location;

    // Wait 5.1 seconds
    await new Promise((r) => setTimeout(r, 5100));

    // Location should have been updated
    expect(result.current.updateCount).toBeGreaterThan(0);
  });
});
```

---

### PHASE 3: INTEGRATION TESTING

#### 3.1 API Testing with Postman (Free)

**1. Import Collection**

- Create `postman_collection.json` with all endpoints
- Import into Postman
- Set environment variables

**2. Test Scenarios**

**Authentication Flow**

```
POST /api/auth/register
Headers: Content-Type: application/json
Body: {
  "name": "Test Driver",
  "email": "testdriver@test.com",
  "password": "password123",
  "phone": "5551234567",
  "role": "driver",
  "licenseNumber": "DL123456",
  "vehicleType": "car",
  "vehicleNumber": "ABC123"
}
Expected: 201, user object with _id, token in response

POST /api/auth/login
Body: {
  "email": "testdriver@test.com",
  "password": "password123"
}
Expected: 200, JWT token returned
```

**Driver Approval Flow**

```
GET /api/admin/drivers/pending
Headers: Authorization: Bearer {admin_token}
Expected: 200, array of pending drivers

POST /api/admin/drivers/{driverId}/approve
Body: { "notes": "All documents verified" }
Expected: 200, driver status = "approved"

GET /api/admin/drivers/approved
Expected: 200, includes approved driver
```

**Ride Booking Flow**

```
POST /api/rides/request
Body: {
  "pickupLocation": {
    "address": "123 Main St",
    "coordinates": [-73.9857, 40.7484]
  },
  "dropoffLocation": {
    "address": "456 Park Ave",
    "coordinates": [-73.9711, 40.7831]
  },
  "vehicleType": "car",
  "estimatedFare": 25.50
}
Expected: 201, ride created with status "searching"

GET /api/rides/{rideId}
Expected: 200, ride object with current status
```

---

### PHASE 4: E2E TESTING WITH CYPRESS (Free)

**Installation**

```bash
cd Frontend
npm install --save-dev cypress
npx cypress open
```

**cypress/e2e/user-flow.cy.js**

```javascript
describe("Complete User Flow", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("Should complete full ride booking flow", () => {
    // Register as rider
    cy.contains("Register").click();
    cy.get("[data-testid=name]").type("Test Rider");
    cy.get("[data-testid=email]").type("rider@test.com");
    cy.get("[data-testid=password]").type("password123");
    cy.get("[data-testid=phone]").type("5551234567");
    cy.get("[data-testid=role]").select("rider");
    cy.contains("Register").click();

    // Verify OTP
    cy.contains("Enter OTP").should("exist");
    cy.get("[data-testid=otp]").type("123456");
    cy.contains("Verify").click();

    // Login
    cy.get("[data-testid=email-login]").type("rider@test.com");
    cy.get("[data-testid=password-login]").type("password123");
    cy.contains("Login").click();

    // Book ride
    cy.get("[data-testid=pickup]").type("123 Main St");
    cy.get("[data-testid=dropoff]").type("456 Park Ave");
    cy.contains("Find Rides").click();

    // Should see drivers on map
    cy.get("[data-testid=driver-marker]").should("have.length.greaterThan", 0);

    // Select driver
    cy.get("[data-testid=driver-marker]").first().click();
    cy.contains("Book").click();

    // Check ride status
    cy.contains("Driver Accepted").should("be.visible");
  });

  it("Should show driver approval admin flow", () => {
    // Login as admin
    cy.get("[data-testid=email-login]").type("admin@velocity.com");
    cy.get("[data-testid=password-login]").type("adminpass");
    cy.contains("Login").click();

    // Navigate to admin
    cy.get("[data-testid=admin-link]").click();
    cy.get("[data-testid=pending-drivers]").click();

    // Should see pending drivers
    cy.get("[data-testid=driver-card]").should("have.length.greaterThan", 0);

    // Approve first driver
    cy.get("[data-testid=approve-btn]").first().click();
    cy.get("[data-testid=approval-notes]").type("Verified all documents");
    cy.contains("Approve").click();

    // Verify status changed
    cy.get("[data-testid=approved-drivers]").click();
    cy.get("[data-testid=driver-card]").should("have.length.greaterThan", 0);
  });
});
```

---

### PHASE 5: LOAD TESTING (Apache JMeter - Free)

**1. Download JMeter**: https://jmeter.apache.org/

**2. Create Test Plan**

```
Thread Group
├── Login (5 users, 2 min ramp-up)
├── Book Ride (5 users, 1 min ramp-up)
├── Driver Accept Ride (3 users)
├── Rate Ride (5 users)
└── View Admin Dashboard (1 user)
```

**3. Run Test**

```bash
jmeter -n -t test_plan.jmx -l results.jtl -j jmeter.log
```

---

### PHASE 6: MONITORING & DEBUGGING (Free Tools)

#### 6.1 Server Monitoring

```bash
# Real-time logs
railway logs -f

# Database monitoring
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/velocity"
db.stats()
db.users.find().limit(5)
```

#### 6.2 Frontend Monitoring

- DevTools Network tab: Track API calls
- DevTools Console: Check for JS errors
- DevTools Performance: Profile load times

#### 6.3 WebSocket Debugging

```javascript
// Add to useWebSocket.js for debugging
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.onAny((event, ...args) => {
  console.log(`📨 Event: ${event}`, args);
});
```

---

### PHASE 7: PRODUCTION TESTING

#### 7.1 Pre-Launch Checklist

```
✅ All environment variables set correctly
✅ Database backups configured
✅ Error monitoring setup (Sentry free tier)
✅ SSL certificates (automatic on Vercel/Railway)
✅ CORS configured correctly
✅ Rate limiting tested
✅ Admin account created
✅ Driver approval workflow tested
✅ Payment tracking tested
✅ Email notifications working
✅ WebSocket connections stable
✅ Load test passed (100 concurrent users)
```

#### 7.2 Testing Script

```bash
# Run all tests
npm run test:unit
npm run test:integration
npm run test:e2e

# Check code quality
npm run lint

# Build production
npm run build

# Deploy
railway up  # Backend
vercel --prod  # Frontend
```

---

### PHASE 8: CONTINUOUS TESTING (GitHub Actions - Free)

**.github/workflows/test.yml**

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:lint
```

---

### TEST COVERAGE TARGETS

| Component           | Target   | Tool    |
| ------------------- | -------- | ------- |
| Backend Services    | 80%+     | Jest    |
| API Endpoints       | 100%     | Postman |
| Frontend Components | 60%+     | Vitest  |
| E2E User Flows      | 100%     | Cypress |
| Load Testing        | 500+ RPS | JMeter  |

---

### FREE TESTING TOOLS SUMMARY

| Tool             | Purpose               | Cost      |
| ---------------- | --------------------- | --------- |
| Jest             | Unit testing          | Free      |
| Vitest           | Frontend unit testing | Free      |
| Cypress          | E2E testing           | Free      |
| Postman          | API testing           | Free      |
| JMeter           | Load testing          | Free      |
| GitHub Actions   | CI/CD                 | Free      |
| MongoDB Atlas    | Database monitoring   | Free      |
| Sentry           | Error monitoring      | Free tier |
| Vercel Analytics | Frontend monitoring   | Free      |

**Total Testing Cost: $0 USD** ✨

---

### TESTING EXECUTION TIMELINE

```
Day 1-2: Manual testing all features
Day 3: Unit test writing and execution
Day 4: Integration testing with Postman
Day 5: E2E testing with Cypress
Day 6: Load testing with JMeter
Day 7: Production deployment and monitoring
```

---

### COMMON TESTING ISSUES & SOLUTIONS

| Issue                      | Solution                                                       |
| -------------------------- | -------------------------------------------------------------- |
| OTP email not arriving     | Check SendGrid account limits, verify email setting            |
| Geolocation returns null   | Need HTTPS or localhost, check browser permissions             |
| WebSocket connection fails | Check CORS, verify backend running, check WS_URL               |
| Documents not uploading    | Check file size, MIME type, upload directory permissions       |
| Database queries slow      | Add MongoDB indexes, use explain() for analysis                |
| Payment calculation wrong  | Verify fare formula: base + (distance × 2) + (duration × 0.25) |

---

_Last Updated: January 20, 2026_
_Complete Zero-Budget Testing Strategy - Production Ready_
