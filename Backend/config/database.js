/**
 * MongoDB Database Configuration
 * Centralized database connection with pooling and error handling
 */

import mongoose from 'mongoose';
import { DB_CONFIG } from './constants.js';

class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect() {
    try {
      if (this.isConnected) {
        console.log('📊 Using existing database connection');
        return this.connection;
      }

      const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
      
      if (!MONGODB_URI) {
        throw new Error('❌ MongoDB URI is not defined in environment variables');
      }

      console.log('🔗 Connecting to MongoDB...');

      // Connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: DB_CONFIG.CONNECTION_TIMEOUT,
        socketTimeoutMS: DB_CONFIG.SOCKET_TIMEOUT,
        maxPoolSize: DB_CONFIG.POOL_SIZE,
        minPoolSize: 5,
        maxIdleTimeMS: 10000,
        waitQueueTimeoutMS: 10000,
      };

      // Connect to MongoDB
      await mongoose.connect(MONGODB_URI, options);

      this.connection = mongoose.connection;
      this.isConnected = true;

      // Connection event handlers
      this.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Host: ${this.connection.host}`);
        console.log(`📊 Database: ${this.connection.name}`);
        console.log(`📊 Ready State: ${this.connection.readyState}`);
      });

      this.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
        this.isConnected = false;
      });

      this.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      this.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown handler
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      
      // Retry logic
      console.log('🔄 Retrying connection in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return this.connect();
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (this.connection && this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('👋 MongoDB disconnected gracefully');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  /**
   * Get database connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      readyState: this.connection?.readyState || 0,
      host: this.connection?.host || 'Not connected',
      database: this.connection?.name || 'Not connected'
    };
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          message: 'Database not connected'
        };
      }

      // Run a simple query to check connection
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        ...this.getStatus()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        ...this.getStatus()
      };
    }
  }

  /**
   * Create indexes for better performance
   */
  async createIndexes() {
    try {
      console.log('📈 Creating database indexes...');
      
      // Get all models
      const models = mongoose.modelNames();
      
      for (const modelName of models) {
        const model = mongoose.model(modelName);
        if (model.createIndexes) {
          await model.createIndexes();
          console.log(`✅ Created indexes for ${modelName}`);
        }
      }
      
      console.log('📈 All indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
    }
  }

  /**
   * Drop database (for testing only)
   */
  async dropDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Drop database only allowed in test environment');
    }
    
    await mongoose.connection.db.dropDatabase();
    console.log('🧹 Database dropped');
  }
}

// Create singleton instance
const database = new Database();

export { database };
export default database;