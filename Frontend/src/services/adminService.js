// src/services/adminService.js
import api from '../utils/api';

class AdminService {
  async getPendingDrivers() {
    try {
      const response = await api.get('/admin/drivers/pending');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch pending drivers' };
    }
  }

  async getApprovedDrivers() {
    try {
      const response = await api.get('/admin/drivers/approved');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch approved drivers' };
    }
  }

  async approveDriver(driverId, notes = '') {
    try {
      const response = await api.post(`/admin/drivers/${driverId}/approve`, { notes });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to approve driver' };
    }
  }

  async rejectDriver(driverId, reason = '') {
    try {
      const response = await api.post(`/admin/drivers/${driverId}/reject`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to reject driver' };
    }
  }

  async suspendDriver(driverId, reason = '') {
    try {
      const response = await api.post(`/admin/drivers/${driverId}/suspend`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to suspend driver' };
    }
  }

  async getPlatformStats() {
    try {
      const response = await api.get('/admin/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch platform stats' };
    }
  }

  async getSettlementReport(date) {
    try {
      const response = await api.get(`/admin/settlement/report?date=${date}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch settlement report' };
    }
  }
}

export default new AdminService();

