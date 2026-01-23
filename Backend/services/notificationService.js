import logger from "../utils/logger.js";

class NotificationService {
  /**
   * Send ride request notification to driver
   */
  async sendRideRequestNotification(driver, ride, socket) {
    try {
      const notification = {
        id: `ride_req_${ride._id}`,
        type: "ride_request",
        title: "New Ride Request!",
        message: `${ride.rider.name} requested a ride from ${ride.pickupLocation.address}`,
        data: {
          rideId: ride._id,
          riderId: ride.rider._id,
          distance: ride.distance,
          fare: ride.fare.total,
          estimatedTime: ride.estimatedDuration,
        },
        timestamp: new Date(),
        priority: "high",
      };

      // Send via WebSocket
      socket?.to(`driver_${driver._id}`).emit("notification", notification);

      // In production, also send push notification via FCM
      await this.sendPushNotification(driver._id, notification);

      logger.info(`Ride request notification sent to driver ${driver._id}`);
      return notification;
    } catch (error) {
      logger.error("Error sending ride request notification:", error);
    }
  }

  /**
   * Send ride acceptance notification to rider
   */
  async sendRideAcceptedNotification(rider, driver, ride, socket) {
    try {
      const notification = {
        id: `ride_accept_${ride._id}`,
        type: "ride_accepted",
        title: "Ride Accepted!",
        message: `${driver.name} accepted your ride request. Arriving in ${ride.estimatedDuration} minutes`,
        data: {
          rideId: ride._id,
          driverId: driver._id,
          driverName: driver.name,
          driverRating: driver.rating,
          driverPhone: driver.phone,
          vehicleInfo: {
            model: driver.vehicleModel,
            plate: driver.licensePlate,
            color: driver.vehicleColor,
          },
          estimatedArrival: ride.estimatedDuration,
          distance: ride.distance,
        },
        timestamp: new Date(),
        priority: "high",
      };

      socket?.to(`rider_${rider._id}`).emit("notification", notification);
      await this.sendPushNotification(rider._id, notification);

      logger.info(`Ride accepted notification sent to rider ${rider._id}`);
      return notification;
    } catch (error) {
      logger.error("Error sending ride accepted notification:", error);
    }
  }

  /**
   * Send driver arrived notification
   */
  async sendDriverArrivedNotification(rider, driver, ride, socket) {
    try {
      const notification = {
        id: `driver_arrived_${ride._id}`,
        type: "driver_arrived",
        title: "Driver Arrived!",
        message: `${driver.name} has arrived at your pickup location. Please come down.`,
        data: {
          rideId: ride._id,
          driverId: driver._id,
          timestamp: new Date(),
        },
        priority: "high",
      };

      socket?.to(`rider_${rider._id}`).emit("notification", notification);
      await this.sendPushNotification(rider._id, notification);

      logger.info(`Driver arrived notification sent to rider ${rider._id}`);
      return notification;
    } catch (error) {
      logger.error("Error sending driver arrived notification:", error);
    }
  }

  /**
   * Send ride started notification
   */
  async sendRideStartedNotification(rider, driver, ride, socket) {
    try {
      const riderNotif = {
        id: `ride_started_r_${ride._id}`,
        type: "ride_started",
        title: "Ride Started",
        message: `Your ride with ${driver.name} has started. Estimated arrival: ${ride.estimatedDuration} mins`,
        data: {
          rideId: ride._id,
          driverId: driver._id,
        },
        timestamp: new Date(),
        priority: "medium",
      };

      const driverNotif = {
        id: `ride_started_d_${ride._id}`,
        type: "ride_started",
        title: "Ride Started",
        message: `Ride with ${rider.name} started. Destination: ${ride.dropoffLocation.address}`,
        data: {
          rideId: ride._id,
          riderId: rider._id,
        },
        timestamp: new Date(),
        priority: "medium",
      };

      socket?.to(`rider_${rider._id}`).emit("notification", riderNotif);
      socket?.to(`driver_${driver._id}`).emit("notification", driverNotif);

      await this.sendPushNotification(rider._id, riderNotif);
      await this.sendPushNotification(driver._id, driverNotif);

      logger.info(`Ride started notifications sent to both parties`);
      return { riderNotif, driverNotif };
    } catch (error) {
      logger.error("Error sending ride started notification:", error);
    }
  }

  /**
   * Send ride completed notification
   */
  async sendRideCompletedNotification(rider, driver, ride, socket) {
    try {
      const riderNotif = {
        id: `ride_completed_r_${ride._id}`,
        type: "ride_completed",
        title: "Ride Completed",
        message: `Your ride ended at ${ride.dropoffLocation.address}. Total fare: $${ride.fare.total}. Please rate your driver.`,
        data: {
          rideId: ride._id,
          fare: ride.fare.total,
          driverId: driver._id,
          distance: ride.distance,
        },
        timestamp: new Date(),
        priority: "high",
      };

      const driverNotif = {
        id: `ride_completed_d_${ride._id}`,
        type: "ride_completed",
        title: "Ride Completed",
        message: `Ride with ${rider.name} completed. Earned: $${ride.fare.total}. Please rate your rider.`,
        data: {
          rideId: ride._id,
          fare: ride.fare.total,
          riderId: rider._id,
          distance: ride.distance,
        },
        timestamp: new Date(),
        priority: "high",
      };

      socket?.to(`rider_${rider._id}`).emit("notification", riderNotif);
      socket?.to(`driver_${driver._id}`).emit("notification", driverNotif);

      await this.sendPushNotification(rider._id, riderNotif);
      await this.sendPushNotification(driver._id, driverNotif);

      logger.info(`Ride completed notifications sent to both parties`);
      return { riderNotif, driverNotif };
    } catch (error) {
      logger.error("Error sending ride completed notification:", error);
    }
  }

  /**
   * Send cancellation notification
   */
  async sendCancellationNotification(
    cancelledBy,
    otherUser,
    ride,
    reason,
    socket,
  ) {
    try {
      const userType =
        cancelledBy._id.toString() === ride.rider._id.toString()
          ? "rider"
          : "driver";
      const recipient = userType === "rider" ? ride.driver : ride.rider;

      const notification = {
        id: `cancel_${ride._id}`,
        type: "ride_cancelled",
        title: "Ride Cancelled",
        message: `${cancelledBy.name} cancelled the ride. Reason: ${reason || "Not specified"}`,
        data: {
          rideId: ride._id,
          cancelledBy: cancelledBy._id,
          reason,
          timestamp: new Date(),
        },
        priority: "high",
      };

      socket
        ?.to(`${recipient.role || "user"}_${recipient._id}`)
        .emit("notification", notification);
      await this.sendPushNotification(recipient._id, notification);

      logger.info(`Cancellation notification sent`);
      return notification;
    } catch (error) {
      logger.error("Error sending cancellation notification:", error);
    }
  }

  /**
   * Send OTP notification
   */
  async sendOTPNotification(user, otp, socket) {
    try {
      const notification = {
        id: `otp_${user._id}`,
        type: "otp",
        title: "OTP Verification",
        message: `Your ride OTP is: ${otp}. Do not share this with anyone.`,
        data: {
          otp,
          timestamp: new Date(),
        },
        priority: "critical",
      };

      socket?.to(`user_${user._id}`).emit("notification", notification);
      await this.sendSMSNotification(
        user.phone,
        `Your VeloCity ride OTP is: ${otp}. Do not share this with anyone.`,
      );

      logger.info(`OTP notification sent to ${user._id}`);
      return notification;
    } catch (error) {
      logger.error("Error sending OTP notification:", error);
    }
  }

  /**
   * Send SMS notification via Twilio
   */
  async sendSMSNotification(phoneNumber, message) {
    try {
      // This will be implemented with Twilio in production
      // For now, just log it
      logger.info(`SMS to ${phoneNumber}: ${message}`);

      // Uncomment when Twilio is configured:
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // });

      return true;
    } catch (error) {
      logger.error("Error sending SMS notification:", error);
      return false;
    }
  }

  /**
   * Send push notification via Firebase Cloud Messaging
   */
  async sendPushNotification(userId, notification) {
    try {
      // This will be implemented with Firebase FCM in production
      // For now, just log it
      logger.info(`Push notification to ${userId}: ${notification.title}`);

      // Uncomment when Firebase is configured:
      // const admin = require('firebase-admin');
      // const message = {
      //   notification: {
      //     title: notification.title,
      //     body: notification.message
      //   },
      //   data: notification.data,
      //   webpush: {
      //     urgency: 'high'
      //   }
      // };
      // await admin.messaging().sendToDevice(userDeviceToken, message);

      return true;
    } catch (error) {
      logger.error("Error sending push notification:", error);
      return false;
    }
  }

  /**
   * Send in-app alert for emergency situations
   */
  async sendEmergencyAlert(user, message, socket) {
    try {
      const alert = {
        id: `emergency_${Date.now()}`,
        type: "emergency",
        title: "Emergency Alert",
        message,
        data: {
          timestamp: new Date(),
          severity: "high",
        },
        priority: "critical",
      };

      socket?.to(`user_${user._id}`).emit("notification", alert);
      logger.warn(`Emergency alert sent to ${user._id}: ${message}`);

      return alert;
    } catch (error) {
      logger.error("Error sending emergency alert:", error);
    }
  }

  /**
   * Clear old notifications (optional cleanup)
   */
  async clearOldNotifications(userId, olderThanDays = 30) {
    try {
      // This would be implemented if storing notifications in DB
      logger.info(`Clearing old notifications for user ${userId}`);
      return true;
    } catch (error) {
      logger.error("Error clearing old notifications:", error);
      return false;
    }
  }
}

export default new NotificationService();
