// src/services/documentUploadService.js
// Handle driver document uploads to local server storage
// Uses free local storage (can be migrated to S3/similar in production)

import fs from "fs";
import path from "path";
import crypto from "crypto";
import logger from "../utils/logger.js";

class DocumentUploadService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads", "driver-documents");
    this.allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB

    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  /**
   * Ensure upload directory exists
   */
  ensureUploadDirectory() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
        logger.info(`✅ Created upload directory: ${this.uploadDir}`);
      }
    } catch (error) {
      logger.error("❌ Error creating upload directory:", error);
    }
  }

  /**
   * Validate file
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, error: "No file provided" };
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${this.allowedMimeTypes.join(", ")}`,
      };
    }

    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum of ${this.maxFileSize / 1024 / 1024}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  generateFilename(originalName, driverId) {
    const ext = path.extname(originalName);
    const random = crypto.randomBytes(8).toString("hex");
    return `${driverId}-${Date.now()}-${random}${ext}`;
  }

  /**
   * Save file to server
   */
  async saveFile(file, driverId, documentType) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate filename
      const filename = this.generateFilename(file.originalname, driverId);
      const filepath = path.join(this.uploadDir, filename);
      const relativeUrl = `/uploads/driver-documents/${filename}`;

      // Save file
      fs.writeFileSync(filepath, file.buffer);

      logger.info(
        `✅ Document uploaded: ${documentType} for driver ${driverId}`,
      );

      return {
        success: true,
        filename,
        url: relativeUrl,
        filepath,
        size: file.size,
        mimeType: file.mimetype,
        documentType,
      };
    } catch (error) {
      logger.error("❌ Error saving file:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filename) {
    try {
      const filepath = path.join(this.uploadDir, filename);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        logger.info(`✅ File deleted: ${filename}`);
        return { success: true };
      }

      return { success: false, error: "File not found" };
    } catch (error) {
      logger.error("❌ Error deleting file:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file stats
   */
  getUploadStats() {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const totalSize = files.reduce((sum, file) => {
        const filepath = path.join(this.uploadDir, file);
        const stats = fs.statSync(filepath);
        return sum + stats.size;
      }, 0);

      return {
        totalFiles: files.length,
        totalSizeGB: (totalSize / 1024 / 1024 / 1024).toFixed(2),
        uploadDirectory: this.uploadDir,
      };
    } catch (error) {
      logger.error("❌ Error getting upload stats:", error);
      return { error: error.message };
    }
  }
}

export default new DocumentUploadService();
