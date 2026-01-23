import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['rider', 'driver', 'admin'],
    required: [true, 'Role is required'],
    default: 'rider'
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  
  // REMOVED: driverInfo field - Use separate Driver model instead
  
  // Rider-specific fields (only for riders)
  riderInfo: {
    paymentMethods: [{
      type: String,
      enum: ['card', 'cash', 'wallet', 'upi']
    }],
    preferredPayment: {
      type: String,
      enum: ['card', 'cash', 'wallet', 'upi'],
      default: 'card'
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRides: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1 });

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Pre-save hook for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is driver
userSchema.virtual('isDriver').get(function() {
  return this.role === 'driver';
});

// Check if user is rider
userSchema.virtual('isRider').get(function() {
  return this.role === 'rider';
});

export default mongoose.model('User', userSchema);
