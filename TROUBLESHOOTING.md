# VeloCity Troubleshooting Guide

## Common Errors and Solutions

### 1. WebSocket Connection Failed (ws://localhost:5000/)

**Error:**

```
WebSocket connection to 'ws://localhost:5000/' failed
```

**Cause:** Backend server is not running or Socket.io is not properly initialized.

**Solution:**

#### Step 1: Start the Backend Server

```bash
cd Backend
npm install
node server.js
```

Expected output:

```
✅ MongoDB connected successfully
🚀 VeloCity Backend Server running on port 5000
📚 API Docs: http://localhost:5000/api/docs
```

#### Step 2: Verify MongoDB Connection

Ensure MongoDB is running:

```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Step 3: Check Environment Variables

Verify `.env` file in Backend folder:

```env
MONGODB_URI=mongodb://localhost:27017/velocity
PORT=5000
JWT_SECRET=your_jwt_secret
```

#### Step 4: Start Frontend

```bash
cd Frontend
npm install
npm run dev
```

Expected output:

```
✅ VITE is running at http://localhost:3000
```

---

### 2. TypeError: Cannot read properties of null (reading '\_id')

**Error:**

```
Cannot read properties of null (reading '_id')
    at RideBooking.jsx:97
```

**Cause:** User context not loaded when component mounts.

**Solution:**

✅ **FIXED in latest update**

Changes made:

- Added null checks before accessing `user._id`
- Added guard clauses in useEffect dependencies
- Added try-catch blocks for error handling

The component now properly waits for user authentication before attempting to access user properties.

---

### 3. Failed to Load Resource: 400 Bad Request (/api/auth/login)

**Error:**

```
POST /api/auth/login 400 (Bad Request)
```

**Possible Causes:**

1. Invalid email/password format
2. User doesn't exist
3. Server validation failed

**Solutions:**

#### Check Backend Validation

```javascript
// Backend/middleware/validation.js
// Verify email and password requirements
```

#### Test Login with cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

#### Ensure User Exists

Create a test user first:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "phone": "+1234567890",
    "role": "rider"
  }'
```

---

### 4. ESLint: Invalid or Unexpected Token

**Error:**

```
SyntaxError: Invalid or unexpected token
```

**Solution:**

All syntax errors have been fixed in the latest update. If you still see this:

1. Clear cache:

```bash
cd Frontend
rm -rf node_modules/.vite
npm run dev
```

2. Restart ESLint server:

```
Ctrl+Shift+P → ESLint: Restart ESLint Server
```

---

## Setup Checklist

- [ ] **Backend Running**
  - [ ] MongoDB connected (check port 27017)
  - [ ] Server listening on port 5000
  - [ ] No errors in console

- [ ] **Frontend Running**
  - [ ] Vite dev server on port 3000
  - [ ] Can access http://localhost:3000
  - [ ] No WebSocket errors

- [ ] **Authentication**
  - [ ] Can register new user
  - [ ] Can login with credentials
  - [ ] JWT token stored in localStorage
  - [ ] Auth header working (check Network tab)

- [ ] **WebSocket Connection**
  - [ ] Browser console shows "✅ WebSocket connected"
  - [ ] No "Failed to connect" messages
  - [ ] Can see socket events in Network → WS tab

- [ ] **Ride Booking**
  - [ ] Can select pickup location
  - [ ] Can select dropoff location
  - [ ] Booking button enabled
  - [ ] Ride request broadcasts to drivers

---

## Database Verification

### Check MongoDB Connection

```bash
# Connect to MongoDB
mongo

# Show databases
show dbs

# Switch to velocity database
use velocity

# Check collections
show collections

# Verify users
db.users.find().pretty()

# Verify rides
db.rides.find().pretty()

# Verify drivers
db.drivers.find().pretty()
```

---

## Network Debugging

### Check API Calls (Browser DevTools)

1. Open DevTools → Network tab
2. Filter for XHR requests
3. Check:
   - Request headers (Authorization token present?)
   - Response status (200, 400, 401, 500?)
   - Response body (error message?)

### Check WebSocket (Browser DevTools)

1. Open DevTools → Network tab
2. Filter for WS (WebSocket)
3. Look for connection status:
   - `101 Switching Protocols` = Success
   - Connection should remain open

---

## Performance Optimization

### If Backend is Slow

1. Check MongoDB indexes:

```javascript
db.drivers.getIndexes();
db.rides.getIndexes();
```

2. Monitor connections:

```bash
mongosh
db.serverStatus().connections
```

### If Frontend is Slow

1. Check bundle size:

```bash
npm run build
npm install -g serve
serve -s dist
```

2. Check for console errors
3. Monitor Network → Throttling (test on slow connection)

---

## Common Port Issues

**Port 5000 already in use?**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Port 3000 already in use?**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

---

## Logs

### Backend Logs

```bash
# Backend logs to console
# Check for:
# - MongoDB connection status
# - Server startup message
# - Route registrations
# - WebSocket connections
```

### Frontend Logs

```javascript
// Check browser console for:
// - Authentication status
// - WebSocket connection status
// - API response errors
// - Component lifecycle errors
```

---

## Help & Support

If issues persist:

1. **Clear all data and restart:**

   ```bash
   # Stop all processes
   # Delete MongoDB data
   # Delete node_modules
   # npm install
   # npm run dev
   ```

2. **Check documentation:**
   - See QUICK_START.md
   - See API_TESTING_GUIDE.md
   - See IMPLEMENTATION_GUIDE.md

3. **Verify all files:**
   - Ensure no files are missing
   - Check Backend/services/ folder
   - Check Frontend/src/components/ folder
