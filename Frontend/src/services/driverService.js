// src/services/driverService.js
import api from '../utils/api';

class DriverService {
  async getDashboard() {
    try {
      const response = await api.get('/driver/dashboard');
      return { success: true, data: response.data?.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch dashboard' };
    }
  }

  async updateStatus(isOnline) {
    try {
      const response = await api.patch('/driver/status', { isOnline });
      return { success: true, data: response.data?.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to update status' };
    }
  }

  async getAvailableRides() {
    try {
      const response = await api.get('/driver/rides/available');
      return { success: true, data: response.data?.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch available rides' };
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/driver/profile');
      return { success: true, data: response.data?.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch profile' };
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/driver/profile', profileData);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to update profile' };
    }
  }

  async getCurrentRide() {
    try {
      const response = await api.get('/driver/ride/current');
      return { success: true, data: response.data?.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch current ride' };
    }
  }
}

export default new DriverService();
