import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pickupLocation: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    dropoffLocation: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "otp_pending",
        "in_progress",
        "driver_arrived",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },
    // OTP Verification
    otp: {
      code: String,
      verified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
      verifiedBy: {
        type: String,
        enum: ["driver", "rider"],
      },
    },
    fare: {
      baseFare: Number,
      distanceFare: Number,
      timeFare: Number,
      surgeMultiplier: Number,
      total: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
    distance: Number, // in kilometers
    estimatedDuration: Number, // in minutes
    actualDuration: Number, // in minutes
    rideType: {
      type: String,
      enum: ["standard", "comfort", "premium"],
      default: "standard",
    },
    // Route tracking
    route: {
      polyline: String,
      waypoints: [
        {
          lat: Number,
          lng: Number,
          timestamp: Date,
        },
      ],
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "wallet", "upi"],
      default: "card",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    // Ride times
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    arrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: {
      type: String,
      enum: ["rider", "driver", "admin"],
    },
    // Rating & Review
    rating: {
      byRider: {
        rating: Number,
        comment: String,
        ratedAt: Date,
      },
      byDriver: {
        rating: Number,
        comment: String,
        ratedAt: Date,
      },
    },
    // Rider feedback
    riderFeedback: {
      vehicleCondition: Number, // 1-5
      driverBehavior: Number, // 1-5
      safetyRating: Number, // 1-5
      comments: String,
    },
    // Driver feedback
    driverFeedback: {
      riderBehavior: Number, // 1-5
      cleanliness: Number, // 1-5
      respectful: Boolean,
      comments: String,
    },
    scheduledAt: Date,
    isScheduled: {
      type: Boolean,
      default: false,
    },
    specialRequirements: String, // Accessible vehicle, etc
    emergencyContact: {
      name: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  },
);

rideSchema.index({ rider: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });
rideSchema.index({ status: 1 });
rideSchema.index({ "pickupLocation.coordinates": "2dsphere" });
rideSchema.index({ createdAt: -1 });

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
