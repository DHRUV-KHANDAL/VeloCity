import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensure one driver record per user
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["car", "bike", "auto"],
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    vehicleColor: String,
    vehicleModel: String,

    // Document URLs (stored on server)
    documents: {
      licensePhoto: String, // License document photo
      vehicleRegistration: String, // Vehicle registration
      insuranceProof: String, // Insurance proof
      drivingRecord: String, // Driving record/background check
      panCard: String, // PAN/ID proof
    },

    // Approval workflow
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvalNotes: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: Date,
    suspensionReason: String,
    suspensionDate: Date,

    isOnline: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    cancellationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    onlineHoursToday: {
      type: Number,
      default: 0,
    },
    lastOnlineTime: Date,

    // KYC Status
    kycVerified: {
      type: Boolean,
      default: false,
    },
    kycVerificationDate: Date,

    // Bank account for payouts (cash model - for records only)
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },

    // Earnings tracking
    totalEarnings: {
      type: Number,
      default: 0,
    },
    earningsThisMonth: {
      type: Number,
      default: 0,
    },
    pendingPayment: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
driverSchema.index({ user: 1 });
driverSchema.index({ approvalStatus: 1 });
driverSchema.index({ currentLocation: "2dsphere" });
driverSchema.index({ isOnline: 1 });
driverSchema.index({ rating: -1 });
driverSchema.index({ createdAt: -1 });

export default mongoose.model("Driver", driverSchema);
