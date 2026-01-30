// src/services/paymentService.js
import api from '../utils/api';

class PaymentService {
  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments/create', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to create payment' };
    }
  }

  async verifyPayment(verificationData) {
    try {
      const response = await api.post('/payments/verify', verificationData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to verify payment' };
    }
  }

  async getPaymentHistory(page = 1, limit = 10) {
    try {
      const response = await api.get(`/payments/history?page=${page}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch payment history' };
    }
  }

  async getPayment(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to fetch payment' };
    }
  }
}

export default new PaymentService();
