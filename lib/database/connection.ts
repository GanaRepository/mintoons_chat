// lib/database/connection.ts - MongoDB connection management
import * as mongoose from 'mongoose';

interface ConnectionState {
  isConnected?: number;
}

const connection: ConnectionState = {};

export async function connectDB(): Promise<void> {
  // If already connected, return
  if (connection.isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    // Connect to MongoDB
    const db = await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: process.env.MONGODB_DB_NAME || 'mintoons',
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connection.isConnected = db.connections[0]?.readyState ?? 0;

    console.log('MongoDB connected successfully');

    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

    mongoose.connection.on('error', error => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      connection.isConnected = 0;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (connection.isConnected) {
    await mongoose.connection.close();
    connection.isConnected = 0;
    console.log('MongoDB disconnected');
  }
}

// Health check function
export async function checkDBHealth(): Promise<{
  status: string;
  message: string;
}> {
  try {
    if (!connection.isConnected) {
      return { status: 'error', message: 'Database not connected' };
    }

    // Ping the database
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not available');
    }
    await db.admin().ping();

    return { status: 'healthy', message: 'Database connection is healthy' };
  } catch (error) {
    return {
      status: 'error',
      message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Get connection stats
export function getConnectionStats() {
  return {
    isConnected: !!connection.isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
}
