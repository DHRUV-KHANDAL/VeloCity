// src/services/rideService.js
import api from '../utils/api';

class RideService {
  async requestRide(rideData) {
    try {
      const response = await api.post('/rides/request', rideData);
      return { success: true, ride: response.data?.ride };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to request ride' };
    }
  }

  async getRide(rideId) {
    try {
      const response = await api.get(`/rides/${rideId}`);
      return { success: true, ride: response.data?.ride };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch ride' };
    }
  }

  async getRideHistory(type = 'all', page = 1, limit = 10) {
    try {
      const response = await api.get(`/rides/history/${type}?page=${page}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch ride history' };
    }
  }

  async cancelRide(rideId, reason) {
    try {
      const response = await api.post(`/rides/${rideId}/cancel`, { reason });
      return { success: true, ride: response.data?.ride };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to cancel ride' };
    }
  }

  async rateRide(rideId, rating, comment = '') {
    try {
      const response = await api.post(`/rides/${rideId}/rate`, { rating, comment });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to rate ride' };
    }
  }

  async verifyOTP(rideId, otp) {
    try {
      const response = await api.post(`/rides/${rideId}/verify-otp`, { otp });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to verify OTP' };
    }
  }

  async startRide(rideId) {
    try {
      const response = await api.post(`/rides/${rideId}/start`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to start ride' };
    }
  }

  async completeRide(rideId, completionData) {
    try {
      const response = await api.post(`/rides/${rideId}/complete`, completionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to complete ride' };
    }
  }

  async arrivedAtPickup(rideId) {
    try {
      const response = await api.post(`/rides/${rideId}/arrived`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to update arrival' };
    }
  }
}

export default new RideService();
