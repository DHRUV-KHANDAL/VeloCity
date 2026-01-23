# Quick Start - Run VeloCity Locally

## 🚀 Prerequisites

- Node.js 16+ installed
- MongoDB running locally (port 27017)
- Two terminal windows

---

## 📋 Step-by-Step Setup

### Terminal 1: Backend Server

```bash
# 1. Navigate to backend
cd Backend

# 2. Install dependencies
npm install

# 3. Verify .env file exists with:
# MONGODB_URI=mongodb://localhost:27017/velocity
# PORT=5000
# JWT_SECRET=your_secret_key

# 4. Start server
node server.js
```

**Expected Output:**

```
✅ MongoDB connected successfully
🚀 VeloCity Backend Server running on port 5000
📚 API Docs: http://localhost:5000/api/docs
```

---

### Terminal 2: Frontend App

```bash
# 1. Navigate to frontend
cd Frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

**Expected Output:**

```
✅ VITE v... ready in XXX ms
➜  Local:   http://localhost:3000/
```

---

## ✅ Verification Checklist

Open http://localhost:3000 and:

1. **See Login Page?** ✅
   - Try registering a new account
   - Role: `rider` or `driver`

2. **Login Works?** ✅
   - You should see the dashboard
   - Token in browser console: `localStorage.getItem('token')`

3. **WebSocket Connected?** ✅
   - Browser console should show: `✅ WebSocket connected`
   - Check DevTools → Network → WS tab

4. **Can Book Rides?** (Rider) ✅
   - Enter pickup and dropoff locations
   - Click "Book Ride"
   - Should see "Searching for drivers..."

5. **Can Accept Rides?** (Driver) ✅
   - Toggle "Go Online" (on driver dashboard)
   - Should see "Available Rides" if rider booked

---

## 🔧 MongoDB Verification

```bash
# Check if MongoDB is running
mongo

# Connect to velocity database
use velocity

# Check if collections exist
show collections

# Verify data
db.users.count()
db.rides.count()
db.drivers.count()
```

---

## 🐛 Common Issues

### Issue: WebSocket Failed to Connect

```
WebSocket connection to 'ws://localhost:5000/socket.io/' failed
```

**Solution:**

- Is backend running on port 5000?
- Check: http://localhost:5000/api/health
- Restart backend: `node server.js`

### Issue: MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

- Start MongoDB: `mongod` (or `brew services start mongodb-community`)
- Verify running: `mongo`

### Issue: Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

### Issue: User is Null Error

```
TypeError: Cannot read properties of null (reading '_id')
```

**Solution:** ✅ FIXED

- Just login and it will work
- Component now has proper null checks

---

## 📊 Test the Full Flow

### As Rider:

1. Login as rider
2. Go to RiderDashboard
3. Click "Book Ride"
4. Enter pickup: "Home" or use "Use Current Location"
5. Enter dropoff: "Office"
6. Select ride type
7. Click "Book Ride"
8. Wait for driver to accept (open another browser window as driver)

### As Driver:

1. Open new incognito window
2. Register as driver
3. Go to DriverDashboard
4. Toggle "Go Online"
5. Should see "Available Rides"
6. Click to accept ride
7. See real-time location tracking

---

## 💡 Tips

- **Open DevTools Console:** F12 to see logs and errors
- **Check Network Requests:** DevTools → Network tab
- **Monitor WebSocket:** DevTools → Network → WS tab
- **Restart Everything:** Kill both terminals, restart in order

---

## 🎯 What Works Now (After Fixes)

✅ User authentication  
✅ WebSocket connection (Socket.io)  
✅ Null safety checks  
✅ Ride booking with location  
✅ Driver acceptance  
✅ Real-time location tracking  
✅ OTP verification  
✅ Ride rating  
✅ Error handling

---

## 📞 Need Help?

See detailed troubleshooting: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
