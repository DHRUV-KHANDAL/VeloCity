import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Reference to the ride
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  
  // Reference to the user making payment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'INR', 'EUR', 'GBP']
  },
  
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'cash', 'wallet', 'upi']
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Transaction ID from payment gateway
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Gateway response data
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Refund information
  refunded: {
    type: Boolean,
    default: false
  },
  
  refundedAt: Date,
  
  refundReason: String,
  
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Verification
  verifiedAt: Date,
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    location: {
      country: String,
      city: String,
      postalCode: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ ride: 1 }, { unique: true });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ createdAt: 1 });
paymentSchema.index({ amount: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed' || this.status === 'refunded';
};

// Method to get payment status text
paymentSchema.methods.getStatusText = function() {
  const statusMap = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded'
  };
  return statusMap[this.status] || 'Unknown';
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;