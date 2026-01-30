// src/services/index.js
import authService from './authService';
import rideService from './rideService';
import driverService from './driverService';
import paymentService from './paymentService';
import adminService from './adminService';
import locationService from './locationService';
import webSocketService from './webSocketService';

export {
  authService,
  rideService,
  driverService,
  paymentService,
  adminService,
  locationService,
  webSocketService
};

export default {
  auth: authService,
  ride: rideService,
  driver: driverService,
  payment: paymentService,
  admin: adminService,
  location: locationService,
  websocket: webSocketService
};
