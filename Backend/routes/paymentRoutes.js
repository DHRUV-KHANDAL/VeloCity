import express from 'express';
import auth from '../middleware/auth.js';
import Payment from '../models/Payment.js';
import Ride from '../models/Ride.js';
import ErrorResponse from '../utils/errorResponse.js';

const router = express.Router();

// Create payment for a ride
router.post('/create', auth, async (req, res, next) => {
  try {
    const { rideId, paymentMethod } = req.body;

    const ride = await Ride.findById(rideId)
      .populate('rider')
      .populate('driver');

    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    // Check authorization
    if (ride.rider._id.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to create payment', 403));
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ ride: rideId });
    if (existingPayment) {
      return next(new ErrorResponse('Payment already exists for this ride', 400));
    }

    // Create payment record
    const payment = new Payment({
      ride: rideId,
      rider: ride.rider._id,
      driver: ride.driver?._id,
      amount: ride.fare?.total || 0,
      paymentMethod,
      status: paymentMethod === 'cash' ? 'completed' : 'pending'
    });

    await payment.save();

    // Update ride with payment reference
    ride.payment = payment._id;
    await ride.save();

    res.status(201).json({
      success: true,
      data: { payment },
      message: 'Payment created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get payment details
router.get('/:id', auth, async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('ride')
      .populate('rider', 'name email')
      .populate('driver', 'name email');

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Check authorization
    if (payment.rider._id.toString() !== req.user._id.toString() &&
        payment.driver._id.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to view this payment', 403));
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's payment history
router.get('/history/user', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Build query based on user role
    if (req.user.role === 'rider') {
      query.rider = req.user._id;
    } else if (req.user.role === 'driver') {
      query.driver = req.user._id;
    } else {
      return next(new ErrorResponse('Invalid user role', 400));
    }

    const payments = await Payment.find(query)
      .populate('ride')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update payment status (webhook for payment providers)
router.post('/webhook/:provider', async (req, res, next) => {
  try {
    const { provider } = req.params;
    const event = req.body;

    // Verify webhook signature (implementation depends on payment provider)
    // This is a simplified example

    if (provider === 'stripe') {
      // Handle Stripe webhook
      const { type, data } = event;
      
      if (type === 'payment_intent.succeeded') {
        const paymentIntent = data.object;
        const payment = await Payment.findOne({
          'paymentDetails.paymentIntentId': paymentIntent.id
        });

        if (payment) {
          payment.status = 'completed';
          payment.paymentDetails.transactionId = paymentIntent.id;
          await payment.save();
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
