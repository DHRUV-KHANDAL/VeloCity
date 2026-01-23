// src/services/emailOTPService.js
// SendGrid Email OTP Service for FREE ride-sharing platform
// Uses SendGrid free tier (100 emails/day)

import fetch from "node-fetch";
import crypto from "crypto";
import logger from "../utils/logger.js";

class EmailOTPService {
  constructor() {
    this.sendgridApiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail =
      process.env.SENDGRID_FROM_EMAIL || "noreply@velocityride.com";
    this.otpStore = new Map(); // In-memory store, use Redis in production
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes
    this.maxAttempts = 3;

    if (!this.sendgridApiKey) {
      logger.warn(
        "⚠️  SENDGRID_API_KEY not set. Email OTP will use mock mode.",
      );
    }
  }

  /**
   * Generate a 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create and store OTP
   */
  async createOTP(email) {
    try {
      const otp = this.generateOTP();
      const expiresAt = Date.now() + this.otpExpiry;

      this.otpStore.set(email, {
        otp,
        expiresAt,
        attempts: 0,
        createdAt: Date.now(),
      });

      logger.info(`📧 OTP created for ${email}: ${otp}`);
      return { otp, expiresAt };
    } catch (error) {
      logger.error("❌ Error creating OTP:", error);
      throw error;
    }
  }

  /**
   * Send OTP via SendGrid email
   */
  async sendOTPEmail(email, userName) {
    try {
      const { otp, expiresAt } = await this.createOTP(email);

      // Mock mode if no API key
      if (!this.sendgridApiKey) {
        logger.info(`📧 [MOCK] OTP Email sent to ${email}`);
        logger.info(`📧 [MOCK] OTP: ${otp} (expires in 10 minutes)`);
        return { success: true, otp, mock: true };
      }

      const message = `
        <html>
          <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
              <h2 style="color: #333; text-align: center; margin-bottom: 30px;">🚗 VeloCity Ride Verification</h2>
              
              <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">
                Hi <strong>${userName}</strong>,
              </p>
              
              <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 30px;">
                Your one-time verification code is:
              </p>
              
              <div style="background: #f0f0f0; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">
                  ${otp}
                </span>
              </div>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 10px;">
                This code expires in 10 minutes
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                If you didn't request this code, please ignore this email.
              </p>
              
              <footer style="text-align: center; color: #bbb; font-size: 11px; margin-top: 30px;">
                <p>© 2024 VeloCity. All rights reserved.</p>
              </footer>
            </div>
          </body>
        </html>
      `;

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email }],
              subject: "🚗 VeloCity - Your Verification Code",
            },
          ],
          from: {
            email: this.fromEmail,
            name: "VeloCity Rides",
          },
          content: [
            {
              type: "text/html",
              value: message,
            },
          ],
        }),
      });

      if (response.ok) {
        logger.info(`✅ OTP email sent successfully to ${email}`);
        return { success: true, otp, expiresAt };
      } else {
        const error = await response.json();
        logger.error("❌ SendGrid error:", error);
        throw new Error("Failed to send OTP email");
      }
    } catch (error) {
      logger.error("❌ Error sending OTP email:", error);
      // Fallback to mock mode
      logger.info(
        `📧 [FALLBACK] Logging OTP for ${email}: Will send email when API key is available`,
      );
      return { success: true, mock: true };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, otp) {
    try {
      const storedOTPData = this.otpStore.get(email);

      if (!storedOTPData) {
        return {
          success: false,
          error: "OTP not found. Please request a new one.",
        };
      }

      if (Date.now() > storedOTPData.expiresAt) {
        this.otpStore.delete(email);
        return {
          success: false,
          error: "OTP expired. Please request a new one.",
        };
      }

      if (storedOTPData.attempts >= this.maxAttempts) {
        this.otpStore.delete(email);
        return {
          success: false,
          error: "Too many attempts. Please request a new OTP.",
        };
      }

      if (storedOTPData.otp !== otp) {
        storedOTPData.attempts++;
        return {
          success: false,
          error: `Invalid OTP. ${this.maxAttempts - storedOTPData.attempts} attempts remaining.`,
        };
      }

      // Correct OTP
      this.otpStore.delete(email);
      logger.info(`✅ OTP verified successfully for ${email}`);
      return { success: true };
    } catch (error) {
      logger.error("❌ Error verifying OTP:", error);
      throw error;
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(email, userName) {
    try {
      this.otpStore.delete(email); // Clear old OTP
      await this.sendOTPEmail(email, userName);
      return { success: true, message: "OTP resent successfully" };
    } catch (error) {
      logger.error("❌ Error resending OTP:", error);
      throw error;
    }
  }

  /**
   * Get OTP stats (for debugging/admin)
   */
  getOTPStats() {
    return {
      totalOTPsActive: this.otpStore.size,
      storageType: "in-memory (use Redis in production)",
      expiryTime: `${this.otpExpiry / 1000 / 60} minutes`,
      maxAttempts: this.maxAttempts,
    };
  }
}

export default new EmailOTPService();
