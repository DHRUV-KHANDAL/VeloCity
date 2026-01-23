# 🚗 VeloCity - FREE Ride-Sharing Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)]()
[![Cost](https://img.shields.io/badge/cost-~%245%2Fmonth-green.svg)]()

A completely **FREE**, production-ready ride-sharing platform built with modern web technologies.

## ✨ Features

### Core Functionality

- 🗺️ **Real-Time Maps** - OpenStreetMap with live driver locations (100% free)
- 📧 **Email OTP Verification** - SendGrid free tier (100 emails/day)
- 💰 **Cash Payment Tracking** - Track all rides and driver earnings
- 👨‍💼 **Admin Dashboard** - Approve drivers, view analytics, settlements
- ⭐ **Rating System** - 5-star bidirectional ratings
- 📍 **Geospatial Queries** - MongoDB 2dsphere for nearby drivers
- 🔄 **Real-Time Communication** - Socket.io WebSocket events
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

### Security

- 🔐 JWT Authentication
- 🛡️ Role-based Access Control (Rider, Driver, Admin)
- 🔒 Password Hashing with bcrypt
- 🚫 Rate Limiting
- 📋 Input Validation
- 📄 Helmet.js Security Headers

### Deployment

- 🚀 **Zero-Cost Hosting** - Railway ($5/mo) + Vercel (free) + MongoDB Atlas (free)
- 🌍 Production-Ready Configuration
- 📊 Error Logging & Monitoring
- 🔄 Auto Scaling Support

## 🎯 Quick Start

### Prerequisites

- Node.js 14+ (recommended 16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/velocity.git
cd velocity

# Install dependencies
cd Backend && npm install
cd ../Frontend && npm install --legacy-peer-deps
```

### Configuration

**Backend/.env**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/velocity
JWT_SECRET=your_secret_key_here
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@velocityride.com
FRONTEND_URL=http://localhost:3000
ADMIN_PANEL_SECRET=admin_secret_123
```

**Frontend/.env**

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

### Running Locally

```bash
# Terminal 1: Start MongoDB
mongod --dbpath ./data

# Terminal 2: Start Backend
cd Backend && npm run dev

# Terminal 3: Start Frontend
cd Frontend && npm run dev
```

Visit http://localhost:3000 in your browser.

## 🗂️ Project Structure

```
VeloCity/
├── Backend/
│   ├── services/              # Business logic
│   │   ├── emailOTPService.js
│   │   ├── documentUploadService.js
│   │   ├── cashPaymentService.js
│   │   ├── locationService.js
│   │   └── ...
│   ├── controllers/           # API handlers
│   │   ├── adminController.js
│   │   └── ...
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Driver.js
│   │   ├── Ride.js
│   │   └── Payment.js
│   ├── routes/               # API routes
│   │   ├── adminRoutes.js
│   │   └── ...
│   └── server.js            # Main entry point
│
├── Frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DriverDashboard.jsx
│   │   │   ├── RiderDashboard.jsx
│   │   │   └── ...
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom hooks
│   │   └── ...
│   └── package.json
│
└── Documentation/
    ├── FREE_DEPLOYMENT_GUIDE.md
    ├── COMPLETE_TESTING_STRATEGY.md
    ├── COMPLETE_IMPLEMENTATION_GUIDE.md
    ├── API_REFERENCE.md
    └── PROJECT_COMPLETION_SUMMARY.md
```

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Admin

- `GET /api/admin/drivers/pending` - List pending drivers
- `POST /api/admin/drivers/:id/approve` - Approve driver
- `POST /api/admin/drivers/:id/reject` - Reject driver
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/settlement/report` - Daily settlement

### Driver

- `GET /api/driver/dashboard` - Driver stats
- `PATCH /api/driver/status` - Toggle online/offline
- `GET /api/driver/rides/available` - Available rides

### Rides

- `POST /api/rides/request` - Request a ride
- `GET /api/rides/:id` - Get ride status
- `POST /api/rides/:id/complete` - Complete ride
- `POST /api/rides/:id/rate` - Rate ride

See [API_REFERENCE.md](API_REFERENCE.md) for complete documentation.

## 📊 Real-Time Features

### WebSocket Events

```javascript
// Driver events
socket.emit("driver_online");
socket.emit("location_update");
socket.emit("accept_ride");

// Rider events
socket.emit("new_ride_request");
socket.on("ride_accepted");
socket.on("driver_location_updated");
```

## 💰 Zero-Cost Stack

| Component | Solution                | Cost       |
| --------- | ----------------------- | ---------- |
| Maps      | OpenStreetMap + Leaflet | $0         |
| Email OTP | SendGrid Free           | $0         |
| Database  | MongoDB Atlas Free      | $0         |
| Backend   | Railway                 | ~$5/mo     |
| Frontend  | Vercel                  | $0         |
| Real-Time | Socket.io               | $0         |
| **Total** |                         | **~$5/mo** |

## 🚀 Deployment

### Production Deployment (20 minutes)

1. **Deploy Backend to Railway**

   ```bash
   railway login
   cd Backend && railway up
   ```

2. **Deploy Frontend to Vercel**

   ```bash
   vercel login
   cd Frontend && vercel --prod
   ```

3. **Setup MongoDB Atlas**
   - Create free tier cluster
   - Get connection string
   - Add to Railway environment

4. **Configure SendGrid**
   - Create account (100 emails/day free)
   - Get API key
   - Add to Railway environment

See [FREE_DEPLOYMENT_GUIDE.md](FREE_DEPLOYMENT_GUIDE.md) for detailed steps.

## 🧪 Testing

### Manual Testing

See [COMPLETE_TESTING_STRATEGY.md](COMPLETE_TESTING_STRATEGY.md) for:

- Unit tests (Jest)
- Integration tests (Postman)
- E2E tests (Cypress)
- Load tests (JMeter)

### Run Tests

```bash
cd Backend && npm run test:unit
cd Frontend && npm run test:unit
```

## 📚 Documentation

- **[FREE_DEPLOYMENT_GUIDE.md](FREE_DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[COMPLETE_IMPLEMENTATION_GUIDE.md](COMPLETE_IMPLEMENTATION_GUIDE.md)** - Technical details
- **[COMPLETE_TESTING_STRATEGY.md](COMPLETE_TESTING_STRATEGY.md)** - Testing guide
- **[API_REFERENCE.md](API_REFERENCE.md)** - API endpoints
- **[PROJECT_COMPLETION_SUMMARY.md](PROJECT_COMPLETION_SUMMARY.md)** - Project status

## 🔑 Key Features Implemented

✅ Real driver registration with document upload  
✅ Admin manual driver approval  
✅ Real-time WebSocket location tracking  
✅ Email OTP verification (SendGrid)  
✅ Cash payment tracking  
✅ MongoDB geospatial queries  
✅ Admin dashboard  
✅ 5-star rating system  
✅ Daily settlement reports  
✅ Driver earnings calculation  
✅ CSV export for accounting  
✅ Production error handling  
✅ Rate limiting & security  
✅ Responsive UI design

## 🛠️ Tech Stack

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.io for real-time
- SendGrid for emails
- JWT authentication
- bcrypt for passwords

### Frontend

- React 18
- Vite (build tool)
- Tailwind CSS
- Leaflet.js for maps
- Socket.io client
- React Router

### Infrastructure

- Railway (backend hosting)
- Vercel (frontend hosting)
- MongoDB Atlas (database)
- SendGrid (email service)
- GitHub (version control)

## 📱 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions

## 🔒 Security Considerations

- ✅ JWT tokens for auth
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ File upload validation
- ✅ Admin-only routes
- ✅ HTTPS in production

## 📈 Scalability

The platform is designed to scale:

- Stateless backend (run multiple instances)
- MongoDB can handle millions of documents
- Socket.io scales with namespaces
- File uploads to cloud storage (S3)
- Redis for caching (optional)

## 🆘 Troubleshooting

**OTP not arriving?**

- Check SendGrid API key is valid
- Check from email is verified

**WebSocket connection failed?**

- Ensure backend is running
- Check WS_URL in frontend .env

**MongoDB connection error?**

- Verify connection string
- Check MongoDB is running (local)
- Check IP whitelist (Atlas)

**Admin can't approve drivers?**

- Verify user role is "admin"
- Check JWT token is valid

See [COMPLETE_TESTING_STRATEGY.md](COMPLETE_TESTING_STRATEGY.md) for more troubleshooting.

## 📞 Support

For issues, questions, or contributions:

1. Check the documentation files
2. Review [API_REFERENCE.md](API_REFERENCE.md)
3. See [COMPLETE_TESTING_STRATEGY.md](COMPLETE_TESTING_STRATEGY.md) for debugging
4. Open an issue on GitHub

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Leaflet.js Documentation](https://leafletjs.com/)

## 🎉 Getting Started

1. ✅ Clone the repository
2. ✅ Install dependencies
3. ✅ Create `.env` files
4. ✅ Start development servers
5. ✅ Visit http://localhost:3000
6. ✅ Register and test!

**Everything is production-ready. Start building!** 🚀

---

**Status:** ✅ Complete & Production-Ready  
**Last Updated:** January 20, 2026  
**Total Development Cost:** $0 + (Optional: $5/mo hosting)

Made with ❤️ for free ride-sharing
