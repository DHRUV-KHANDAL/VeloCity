/**
 * Payment Service
 * Contains business logic for payment operations and gateway integration
 */

import Payment from '../models/Payment.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';
import { PAYMENT_METHODS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';

class PaymentService {
  constructor() {
    // Initialize payment gateways based on environment
    this.gateways = {
      stripe: this.initStripe(),
      razorpay: this.initRazorpay()
    };
  }

  /**
   * Create a new payment for a ride
   */
  async createPayment(rideId, amount, paymentMethod, userId) {
    try {
      console.log(`💰 Creating payment for ride ${rideId}, amount: $${amount}`);

      // Validate payment method
      if (!PAYMENT_METHODS.ALL.includes(paymentMethod)) {
        throw new Error(`Invalid payment method. Must be one of: ${PAYMENT_METHODS.ALL.join(', ')}`);
      }

      // Create payment record
      const payment = new Payment({
        ride: rideId,
        user: userId,
        amount,
        currency: 'USD',
        paymentMethod,
        status: paymentMethod === 'cash' ? 'completed' : 'pending',
        metadata: {
          createdAt: new Date(),
          ipAddress: '127.0.0.1', // In production, get from request
          userAgent: 'Mozilla/5.0' // In production, get from request
        }
      });

      // Process payment based on method
      let paymentResult;
      
      switch (paymentMethod) {
        case 'card':
          paymentResult = await this.processCardPayment(payment);
          break;
        
        case 'wallet':
          paymentResult = await this.processWalletPayment(payment, userId);
          break;
        
        case 'upi':
          paymentResult = await this.processUPIPayment(payment);
          break;
        
        case 'cash':
          paymentResult = await this.processCashPayment(payment);
          break;
        
        default:
          throw new Error(`Payment method ${paymentMethod} not implemented`);
      }

      // Update payment with gateway response
      payment.gatewayResponse = paymentResult;
      payment.status = paymentResult.success ? 'completed' : 'failed';
      
      if (paymentResult.transactionId) {
        payment.transactionId = paymentResult.transactionId;
      }

      await payment.save();

      // Update ride with payment reference
      await Ride.findByIdAndUpdate(rideId, { payment: payment._id });

      console.log(`✅ Payment created: ${payment._id}, status: ${payment.status}`);

      return {
        success: true,
        data: {
          payment,
          paymentUrl: paymentResult.paymentUrl,
          orderId: paymentResult.orderId
        },
        message: SUCCESS_MESSAGES.PAYMENT_SUCCESS
      };
    } catch (error) {
      console.error('❌ Create payment error:', error);
      throw error;
    }
  }

  /**
   * Verify payment with gateway
   */
  async verifyPayment(paymentId, signature, orderId, userId) {
    try {
      console.log(`🔍 Verifying payment: ${paymentId}`);

      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 'completed') {
        return {
          success: true,
          data: { payment },
          message: 'Payment already verified'
        };
      }

      // Verify with payment gateway based on payment method
      let verificationResult;
      
      switch (payment.paymentMethod) {
        case 'card':
          verificationResult = await this.verifyStripePayment(payment, signature, orderId);
          break;
        
        case 'upi':
          verificationResult = await this.verifyRazorpayPayment(payment, signature, orderId);
          break;
        
        default:
          throw new Error(`Verification for ${payment.paymentMethod} not implemented`);
      }

      // Update payment status
      payment.status = verificationResult.success ? 'completed' : 'failed';
      payment.verifiedAt = new Date();
      payment.gatewayResponse.verification = verificationResult;
      
      await payment.save();

      // If payment completed, update ride
      if (payment.status === 'completed') {
        await Ride.findByIdAndUpdate(payment.ride, { 
          paymentStatus: 'paid',
          paidAt: new Date()
        });
      }

      console.log(`✅ Payment verified: ${payment._id}, status: ${payment.status}`);

      return {
        success: verificationResult.success,
        data: { payment },
        message: verificationResult.success 
          ? 'Payment verified successfully' 
          : 'Payment verification failed'
      };
    } catch (error) {
      console.error('❌ Verify payment error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId, page = 1, limit = 10, type = 'all') {
    try {
      // Build query
      const query = { user: userId };
      
      if (type !== 'all') {
        query.status = type;
      }

      // Execute query with pagination
      const payments = await Payment.find(query)
        .populate('ride', 'pickupLocation dropoffLocation fare')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments(query);

      // Calculate summary
      const summary = {
        totalPayments: total,
        totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
        completed: await Payment.countDocuments({ user: userId, status: 'completed' }),
        pending: await Payment.countDocuments({ user: userId, status: 'pending' }),
        failed: await Payment.countDocuments({ user: userId, status: 'failed' })
      };

      return {
        success: true,
        data: {
          payments,
          summary,
          pagination: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit
          }
        }
      };
    } catch (error) {
      console.error('❌ Get payment history error:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId, userId, userRole) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('ride')
        .populate('user', 'name email');

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check authorization
      const isAuthorized = 
        payment.user._id.toString() === userId.toString() ||
        userRole === 'admin';

      if (!isAuthorized) {
        throw new Error('Not authorized to view this payment');
      }

      return {
        success: true,
        data: { payment }
      };
    } catch (error) {
      console.error('❌ Get payment error:', error);
      throw error;
    }
  }

  /**
   * Process refund for a payment
   */
  async refundPayment(paymentId, reason, adminId) {
    try {
      console.log(`↩️  Processing refund for payment: ${paymentId}`);

      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Only completed payments can be refunded');
      }

      if (payment.refunded) {
        throw new Error('Payment already refunded');
      }

      // Process refund with gateway
      let refundResult;
      
      switch (payment.paymentMethod) {
        case 'card':
          refundResult = await this.processStripeRefund(payment);
          break;
        
        case 'upi':
          refundResult = await this.processRazorpayRefund(payment);
          break;
        
        default:
          throw new Error(`Refund for ${payment.paymentMethod} not implemented`);
      }

      // Update payment record
      payment.refunded = true;
      payment.refundedAt = new Date();
      payment.refundReason = reason;
      payment.refundedBy = adminId;
      payment.gatewayResponse.refund = refundResult;
      
      await payment.save();

      // Update ride
      await Ride.findByIdAndUpdate(payment.ride, {
        paymentStatus: 'refunded'
      });

      console.log(`✅ Payment refunded: ${payment._id}`);

      return {
        success: true,
        data: { payment, refundResult },
        message: 'Payment refunded successfully'
      };
    } catch (error) {
      console.error('❌ Refund payment error:', error);
      throw error;
    }
  }

  /**
   * Process card payment with Stripe
   */
  async processCardPayment(payment) {
    try {
      // In production, integrate with Stripe API
      // For now, simulate successful payment
      
      console.log(`💳 Processing card payment: $${payment.amount}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate payment success (90% success rate)
      const success = Math.random() > 0.1;
      
      if (!success) {
        throw new Error('Card payment failed: Insufficient funds');
      }
      
      return {
        success: true,
        transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gateway: 'stripe',
        paymentUrl: null,
        orderId: null
      };
    } catch (error) {
      console.error('❌ Card payment error:', error);
      throw error;
    }
  }

  /**
   * Process wallet payment
   */
  async processWalletPayment(payment, userId) {
    try {
      console.log(`👛 Processing wallet payment: $${payment.amount}`);
      
      // Get user's wallet balance
      const user = await User.findById(userId);
      const walletBalance = user.walletBalance || 0;
      
      if (walletBalance < payment.amount) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
      }
      
      // Deduct from wallet
      user.walletBalance = walletBalance - payment.amount;
      await user.save();
      
      // Create wallet transaction
      const walletTransaction = {
        type: 'debit',
        amount: payment.amount,
        description: `Payment for ride ${payment.ride}`,
        balance: user.walletBalance,
        timestamp: new Date()
      };
      
      // Add to user's transaction history
      user.walletTransactions = user.walletTransactions || [];
      user.walletTransactions.push(walletTransaction);
      await user.save();
      
      return {
        success: true,
        transactionId: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gateway: 'internal',
        paymentUrl: null,
        orderId: null,
        walletTransaction
      };
    } catch (error) {
      console.error('❌ Wallet payment error:', error);
      throw error;
    }
  }

  /**
   * Process UPI payment with Razorpay
   */
  async processUPIPayment(payment) {
    try {
      console.log(`📱 Processing UPI payment: $${payment.amount}`);
      
      // In production, integrate with Razorpay UPI
      // For now, simulate payment link generation
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        transactionId: null,
        gateway: 'razorpay',
        paymentUrl: `https://razorpay.com/payment/${Math.random().toString(36).substr(2, 9)}`,
        orderId: `order_${Date.now()}`,
        upiId: `success@razorpay`
      };
    } catch (error) {
      console.error('❌ UPI payment error:', error);
      throw error;
    }
  }

  /**
   * Process cash payment
   */
  async processCashPayment(payment) {
    try {
      console.log(`💵 Processing cash payment: $${payment.amount}`);
      
      // Cash payments are marked as completed immediately
      // Driver collects cash from rider
      
      return {
        success: true,
        transactionId: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gateway: 'cash',
        paymentUrl: null,
        orderId: null
      };
    } catch (error) {
      console.error('❌ Cash payment error:', error);
      throw error;
    }
  }

  /**
   * Initialize Stripe gateway
   */
  initStripe() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      console.warn('⚠️ Stripe secret key not configured');
      return null;
    }
    
    // In production, initialize Stripe SDK
    // const stripe = require('stripe')(stripeKey);
    
    return {
      name: 'stripe',
      configured: !!stripeKey,
      createPaymentIntent: async (amount, currency) => {
        // Implementation for production
        return { clientSecret: 'mock_client_secret' };
      }
    };
  }

  /**
   * Initialize Razorpay gateway
   */
  initRazorpay() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      console.warn('⚠️ Razorpay keys not configured');
      return null;
    }
    
    // In production, initialize Razorpay SDK
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    
    return {
      name: 'razorpay',
      configured: !!(keyId && keySecret),
      createOrder: async (amount, currency) => {
        // Implementation for production
        return { id: 'order_mock_id', amount: amount * 100 };
      }
    };
  }

  /**
   * Verify Stripe payment
   */
  async verifyStripePayment(payment, signature, orderId) {
    // In production, verify with Stripe webhook
    // For now, simulate verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      verified: true,
      gateway: 'stripe',
      timestamp: new Date()
    };
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(payment, signature, orderId) {
    // In production, verify with Razorpay signature
    // For now, simulate verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      verified: true,
      gateway: 'razorpay',
      timestamp: new Date()
    };
  }

  /**
   * Process Stripe refund
   */
  async processStripeRefund(payment) {
    // In production, process refund through Stripe
    // For now, simulate refund
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      refundId: `re_${Date.now()}`,
      amount: payment.amount,
      currency: payment.currency,
      status: 'succeeded'
    };
  }

  /**
   * Process Razorpay refund
   */
  async processRazorpayRefund(payment) {
    // In production, process refund through Razorpay
    // For now, simulate refund
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      refundId: `rfnd_${Date.now()}`,
      amount: payment.amount,
      currency: payment.currency,
      status: 'processed'
    };
  }

  /**
   * Add payment method for user
   */
  async addPaymentMethod(userId, type, details) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Validate payment method type
      if (!PAYMENT_METHODS.ALL.includes(type)) {
        throw new Error(`Invalid payment method type. Must be one of: ${PAYMENT_METHODS.ALL.join(', ')}`);
      }
      
      // Initialize payment methods array if not exists
      user.paymentMethods = user.paymentMethods || [];
      
      // Create payment method object
      const paymentMethod = {
        id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        details,
        isDefault: user.paymentMethods.length === 0, // First method is default
        addedAt: new Date(),
        lastUsed: null
      };
      
      // Add to user's payment methods
      user.paymentMethods.push(paymentMethod);
      await user.save();
      
      return {
        success: true,
        data: { paymentMethod },
        message: 'Payment method added successfully'
      };
    } catch (error) {
      console.error('❌ Add payment method error:', error);
      throw error;
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId) {
    try {
      const user = await User.findById(userId).select('paymentMethods preferredPayment');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        success: true,
        data: {
          paymentMethods: user.paymentMethods || [],
          preferredPayment: user.preferredPayment || 'card'
        }
      };
    } catch (error) {
      console.error('❌ Get payment methods error:', error);
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(userId, methodId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Find the payment method
      const methodIndex = user.paymentMethods?.findIndex(m => m.id === methodId);
      
      if (methodIndex === -1) {
        throw new Error('Payment method not found');
      }
      
      // Update all methods to not default
      user.paymentMethods?.forEach(method => {
        method.isDefault = false;
      });
      
      // Set the selected method as default
      user.paymentMethods[methodIndex].isDefault = true;
      user.preferredPayment = user.paymentMethods[methodIndex].type;
      
      await user.save();
      
      return {
        success: true,
        data: { defaultMethod: user.paymentMethods[methodIndex] },
        message: 'Default payment method updated'
      };
    } catch (error) {
      console.error('❌ Set default payment method error:', error);
      throw error;
    }
  }

  /**
 * Remove payment method
 */
async removePaymentMethod(userId, methodId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Find the payment method
    const methodIndex = user.paymentMethods?.findIndex(m => m.id === methodId);
    
    if (methodIndex === -1) {
      throw new Error('Payment method not found');
    }
    
    const removedMethod = user.paymentMethods[methodIndex];
    
    // Check if it's the default method
    if (removedMethod.isDefault && user.paymentMethods.length > 1) {
      // Set another method as default
      const nextMethodIndex = methodIndex === 0 ? 1 : 0;
      user.paymentMethods[nextMethodIndex].isDefault = true;
      user.preferredPayment = user.paymentMethods[nextMethodIndex].type;
    }
    
    // Remove the method
    user.paymentMethods.splice(methodIndex, 1);
    await user.save();
    
    return {
      success: true,
      data: { removedMethod },
      message: 'Payment method removed successfully'
    };
  } catch (error) {
    console.error('❌ Remove payment method error:', error);
    throw error;
  }
}

/**
 * Get wallet balance
 */
async getWalletBalance(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      data: {
        balance: user.walletBalance || 0,
        currency: 'USD',
        transactions: user.walletTransactions?.slice(-10) || [] // Last 10 transactions
      }
    };
  } catch (error) {
    console.error('❌ Get wallet balance error:', error);
    throw error;
  }
}

/**
 * Add funds to wallet
 */
async addWalletFunds(userId, amount, paymentMethod = 'card') {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Process payment for wallet top-up
    const paymentResult = await this.processCardPayment({
      amount,
      currency: 'USD',
      paymentMethod: 'card'
    });
    
    if (!paymentResult.success) {
      throw new Error('Payment failed for wallet top-up');
    }
    
    // Update wallet balance
    user.walletBalance = (user.walletBalance || 0) + amount;
    
    // Add transaction record
    const transaction = {
      type: 'credit',
      amount,
      description: `Wallet top-up via ${paymentMethod}`,
      balance: user.walletBalance,
      timestamp: new Date(),
      transactionId: paymentResult.transactionId
    };
    
    user.walletTransactions = user.walletTransactions || [];
    user.walletTransactions.push(transaction);
    
    await user.save();
    
    return {
      success: true,
      data: {
        newBalance: user.walletBalance,
        transaction
      },
      message: 'Funds added to wallet successfully'
    };
  } catch (error) {
    console.error('❌ Add wallet funds error:', error);
    throw error;
  }
}

/**
 * Withdraw funds from wallet
 */
async withdrawWalletFunds(userId, amount, bankAccount) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const currentBalance = user.walletBalance || 0;
    
    if (currentBalance < amount) {
      throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
    }
    
    // Validate bank account details
    if (!bankAccount || !bankAccount.accountNumber) {
      throw new Error('Valid bank account details are required');
    }
    
    // Deduct from wallet
    user.walletBalance -= amount;
    
    // Add withdrawal transaction
    const transaction = {
      type: 'withdrawal',
      amount,
      description: 'Wallet withdrawal',
      balance: user.walletBalance,
      timestamp: new Date(),
      bankAccount: {
        last4: bankAccount.accountNumber.slice(-4),
        bankName: bankAccount.bankName || 'Unknown'
      }
    };
    
    user.walletTransactions = user.walletTransactions || [];
    user.walletTransactions.push(transaction);
    
    await user.save();
    
    return {
      success: true,
      data: {
        newBalance: user.walletBalance,
        transaction
      },
      message: 'Funds withdrawn successfully'
    };
  } catch (error) {
    console.error('❌ Withdraw wallet funds error:', error);
    throw error;
  }
}

/**
 * Get wallet transaction history
 */
async getWalletTransactions(userId, page = 1, limit = 10, type = 'all') {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    let transactions = user.walletTransactions || [];
    
    // Filter by transaction type
    if (type !== 'all') {
      transactions = transactions.filter(t => t.type === type);
    }
    
    // Sort by timestamp (most recent first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          total: transactions.length,
          totalPages: Math.ceil(transactions.length / limit),
          currentPage: page,
          limit
        }
      }
    };
  } catch (error) {
    console.error('❌ Get wallet transactions error:', error);
    throw error;
  }
}

}
export default new PaymentService();