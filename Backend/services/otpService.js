import axios from "axios";

/**
 * OTP Service - Handles OTP generation, sending, and verification
 * Uses Twilio for SMS or Can integrate with other providers
 */

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis
  }

  /**
   * Generate a random OTP
   * @param {number} length - OTP length (default: 6)
   * @returns {string} Generated OTP
   */
  generateOTP(length = 6) {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits.charAt(Math.floor(Math.random() * 10));
    }
    return otp;
  }

  /**
   * Store OTP with phone number
   * @param {string} phone - Phone number
   * @param {string} rideId - Ride ID for tracking
   * @returns {object} OTP details
   */
  createOTP(phone, rideId) {
    const otp = this.generateOTP(6);
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    const attempts = 0;
    const maxAttempts = 3;

    this.otpStore.set(`otp_${phone}_${rideId}`, {
      otp,
      phone,
      rideId,
      expiryTime,
      attempts,
      maxAttempts,
      createdAt: Date.now(),
    });

    return {
      phone,
      rideId,
      expiresIn: 10 * 60, // seconds
      message: "OTP sent successfully",
    };
  }

  /**
   * Send OTP via SMS using Twilio
   * @param {string} phone - Phone number
   * @param {string} otp - OTP to send
   * @returns {promise}
   */
  async sendOTPViaSMS(phone, otp) {
    try {
      // Using Twilio SDK
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.warn("Twilio credentials not configured. OTP:", otp);
        return { success: true, method: "log" };
      }

      const client = require("twilio")(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );

      const message = await client.messages.create({
        body: `Your VeloCity ride OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      return {
        success: true,
        messageId: message.sid,
        method: "sms",
      };
    } catch (error) {
      console.error("Error sending SMS:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify OTP
   * @param {string} phone - Phone number
   * @param {string} enteredOTP - OTP entered by user
   * @param {string} rideId - Ride ID
   * @returns {object} Verification result
   */
  verifyOTP(phone, enteredOTP, rideId) {
    const key = `otp_${phone}_${rideId}`;
    const otpData = this.otpStore.get(key);

    if (!otpData) {
      return {
        success: false,
        error: "OTP not found or expired",
      };
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiryTime) {
      this.otpStore.delete(key);
      return {
        success: false,
        error: "OTP has expired",
      };
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= otpData.maxAttempts) {
      this.otpStore.delete(key);
      return {
        success: false,
        error: "Maximum attempts exceeded",
      };
    }

    // Verify OTP
    if (otpData.otp !== enteredOTP) {
      otpData.attempts += 1;
      this.otpStore.set(key, otpData);
      return {
        success: false,
        error: "Invalid OTP",
        attemptsLeft: otpData.maxAttempts - otpData.attempts,
      };
    }

    // OTP verified successfully
    this.otpStore.delete(key);
    return {
      success: true,
      message: "OTP verified successfully",
    };
  }

  /**
   * Resend OTP
   * @param {string} phone - Phone number
   * @param {string} rideId - Ride ID
   * @returns {object}
   */
  resendOTP(phone, rideId) {
    const key = `otp_${phone}_${rideId}`;
    const otpData = this.otpStore.get(key);

    if (!otpData) {
      return {
        success: false,
        error: "OTP request not found",
      };
    }

    // Generate new OTP
    return this.createOTP(phone, rideId);
  }
}

export default new OTPService();
