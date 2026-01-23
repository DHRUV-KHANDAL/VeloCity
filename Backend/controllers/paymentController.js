/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */

import paymentService from '../services/paymentService.js';
import Ride from '../models/Ride.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';

class PaymentController {
  /**
   * Create payment for a ride
   */
  async createPayment(req, res) {
    try {
      const { rideId, paymentMethod } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Verify the ride exists and user has access
      const ride = await Ride.findById(rideId)
        .populate('rider', 'name email')
        .populate('driver', 'name');

      if (!ride) {
        return res.status(404).json({
          success: false,
          error: ERROR_MESSAGES.RIDE_NOT_FOUND
        });
      }

      // Check if user is authorized
      if (ride.rider._id.toString() !== userId.toString() && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to make payment for this ride'
        });
      }

      // Check if ride is completed
      if (ride.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Payment can only be made for completed rides'
        });
      }

      // Check if payment already exists
      if (ride.payment) {
        return res.status(400).json({
          success: false,
          error: 'Payment already exists for this ride'
        });
      }

      // Create payment
      const result = await paymentService.createPayment(
        rideId,
        ride.fare?.total || 0,
        paymentMethod || 'card',
        userId
      );

      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Create payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error'
      });
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(req, res) {
    try {
      const { paymentId, signature, orderId } = req.body;
      const userId = req.user._id;

      if (!paymentId || !signature || !orderId) {
        return res.status(400).json({
          success: false,
          error: 'Payment ID, signature, and order ID are required'
        });
      }

      const result = await paymentService.verifyPayment(
        paymentId,
        signature,
        orderId,
        userId
      );

      res.json(result);
    } catch (error) {
      console.error('❌ Verify payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Payment verification failed'
      });
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, type = 'all' } = req.query;

      const result = await paymentService.getPaymentHistory(
        userId,
        parseInt(page),
        parseInt(limit),
        type
      );

      res.json(result);
    } catch (error) {
      console.error('❌ Get payment history error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const result = await paymentService.getPayment(id, userId, userRole);
      res.json(result);
    } catch (error) {
      console.error('❌ Get payment error:', error);
      
      if (error.message === 'Payment not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Only admin can process refunds
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required for refunds'
        });
      }

      const result = await paymentService.refundPayment(id, reason, userId);
      res.json(result);
    } catch (error) {
      console.error('❌ Refund payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Refund failed'
      });
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(req, res) {
    try {
      const { type, details } = req.body;
      const userId = req.user._id;

      if (!type || !details) {
        return res.status(400).json({
          success: false,
          error: 'Payment type and details are required'
        });
      }

      const result = await paymentService.addPaymentMethod(userId, type, details);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Add payment method error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add payment method'
      });
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(req, res) {
    try {
      const userId = req.user._id;

      const result = await paymentService.getPaymentMethods(userId);
      res.json(result);
    } catch (error) {
      console.error('❌ Get payment methods error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(req, res) {
    try {
      const { methodId } = req.body;
      const userId = req.user._id;

      if (!methodId) {
        return res.status(400).json({
          success: false,
          error: 'Payment method ID is required'
        });
      }

      const result = await paymentService.setDefaultPaymentMethod(userId, methodId);
      res.json(result);
    } catch (error) {
      console.error('❌ Set default payment method error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to set default payment method'
      });
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(req, res) {
    try {
      const { methodId } = req.params;
      const userId = req.user._id;

      const result = await paymentService.removePaymentMethod(userId, methodId);
      res.json(result);
    } catch (error) {
      console.error('❌ Remove payment method error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to remove payment method'
      });
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(req, res) {
    try {
      const userId = req.user._id;

      const result = await paymentService.getWalletBalance(userId);
      res.json(result);
    } catch (error) {
      console.error('❌ Get wallet balance error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Add funds to wallet
   */
  async addWalletFunds(req, res) {
    try {
      const { amount, paymentMethod } = req.body;
      const userId = req.user._id;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid amount is required'
        });
      }

      const result = await paymentService.addWalletFunds(
        userId,
        parseFloat(amount),
        paymentMethod || 'card'
      );

      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Add wallet funds error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add funds'
      });
    }
  }

  /**
   * Withdraw funds from wallet
   */
  async withdrawWalletFunds(req, res) {
    try {
      const { amount, bankAccount } = req.body;
      const userId = req.user._id;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid amount is required'
        });
      }

      const result = await paymentService.withdrawWalletFunds(
        userId,
        parseFloat(amount),
        bankAccount
      );

      res.json(result);
    } catch (error) {
      console.error('❌ Withdraw wallet funds error:', error);
      
      if (error.message.includes('Insufficient balance')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, type = 'all' } = req.query;

      const result = await paymentService.getTransactionHistory(
        userId,
        parseInt(page),
        parseInt(limit),
        type
      );

      res.json(result);
    } catch (error) {
      console.error('❌ Get transaction history error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
}

export default new PaymentController();