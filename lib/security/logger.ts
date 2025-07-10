// lib/security/logger.ts - Security logging system
import { connectDB } from '@lib/database/connection';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

// Define log event schema
interface LogEvent {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'security';
  category: string;
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  data?: any;
}

// Define log event schema for MongoDB
const logEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  level: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  message: { type: String, required: true },
  userId: { type: String, sparse: true, index: true },
  ipAddress: { type: String, sparse: true },
  userAgent: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
});

// Initialize model with casting
const LogEvent = (mongoose.models.LogEvent ||
  mongoose.model('LogEvent', logEventSchema)) as any;

export class SecurityLogger {
  private logPath: string;

  constructor() {
    this.logPath = process.env.LOG_PATH || path.join(process.cwd(), 'logs');

    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  /**
   * Log an informational event
   */
  async info(
    category: string,
    message: string,
    data?: any,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent(
      'info',
      category,
      message,
      data,
      userId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log a warning event
   */
  async warn(
    category: string,
    message: string,
    data?: any,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent(
      'warn',
      category,
      message,
      data,
      userId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log an error event
   */
  async error(
    category: string,
    message: string,
    error?: Error | any,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const errorData =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    await this.logEvent(
      'error',
      category,
      message,
      errorData,
      userId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log a security event (authentication, authorization, etc.)
   */
  async security(
    category: string,
    message: string,
    data?: any,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent(
      'security',
      category,
      message,
      data,
      userId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Get logs filtered by criteria
   */
  async getLogs(
    filter: {
      level?: 'info' | 'warn' | 'error' | 'security';
      category?: string;
      userId?: string;
      ipAddress?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: LogEvent[]; total: number }> {
    try {
      await connectDB();

      const query: any = {};

      if (filter.level) {
        query.level = filter.level;
      }

      if (filter.category) {
        query.category = filter.category;
      }

      if (filter.userId) {
        query.userId = filter.userId;
      }

      if (filter.ipAddress) {
        query.ipAddress = filter.ipAddress;
      }

      if (filter.startDate || filter.endDate) {
        query.timestamp = {};

        if (filter.startDate) {
          query.timestamp.$gte = filter.startDate;
        }

        if (filter.endDate) {
          query.timestamp.$lte = filter.endDate;
        }
      }

      const [logs, total] = await Promise.all([
        LogEvent.find(query)
          .sort({ timestamp: -1 })
          .skip(offset)
          .limit(limit)
          .exec(),
        LogEvent.countDocuments(query).exec(),
      ]);

      return { logs, total };
    } catch (error) {
      console.error('Error getting logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Clean up old logs
   */
  async cleanupLogs(daysToKeep: number = 30): Promise<number> {
    try {
      await connectDB();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await LogEvent.deleteMany({
        timestamp: { $lt: cutoffDate },
      }).exec();

      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      return 0;
    }
  }

  /**
   * Export logs to file
   */
  async exportLogs(
    filter: {
      level?: 'info' | 'warn' | 'error' | 'security';
      category?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const { logs } = await this.getLogs(filter, 10000, 0);

      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `logs_export_${timestamp}.${format}`;
      const filePath = path.join(this.logPath, filename);

      if (format === 'json') {
        await fs.writeFile(filePath, JSON.stringify(logs, null, 2));
      } else {
        // CSV export
        const headers = 'timestamp,level,category,message,userId,ipAddress\n';
        const rows = logs
          .map(log => {
            return [
              log.timestamp,
              log.level,
              log.category,
              `"${log.message.replace(/"/g, '""')}"`,
              log.userId || '',
              log.ipAddress || '',
            ].join(',');
          })
          .join('\n');

        await fs.writeFile(filePath, headers + rows);
      }

      return filePath;
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw error;
    }
  }

  // Private helper methods

  private async logEvent(
    level: 'info' | 'warn' | 'error' | 'security',
    category: string,
    message: string,
    data?: any,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const logEntry: LogEvent = {
      timestamp: new Date(),
      level,
      category,
      message,
      userId,
      ipAddress,
      userAgent,
      data,
    };

    // Log to console
    this.logToConsole(logEntry);

    // Log to file
    await this.logToFile(logEntry);

    // Log to database
    await this.logToDatabase(logEntry);
  }

  private logToConsole(logEntry: LogEvent): void {
    const timestamp = logEntry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.category}]`;

    switch (logEntry.level) {
      case 'info':
        console.info(`${prefix} ${logEntry.message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${logEntry.message}`);
        break;
      case 'error':
        console.error(`${prefix} ${logEntry.message}`);
        if (logEntry.data) {
          console.error(logEntry.data);
        }
        break;
      case 'security':
        console.warn(`${prefix} ${logEntry.message}`);
        break;
    }
  }

  private async logToFile(logEntry: LogEvent): Promise<void> {
    try {
      const timestamp = logEntry.timestamp.toISOString();
      const userId = logEntry.userId ? ` [User: ${logEntry.userId}]` : '';
      const ip = logEntry.ipAddress ? ` [IP: ${logEntry.ipAddress}]` : '';

      const logLine = `[${timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.category}]${userId}${ip} ${logEntry.message}\n`;

      const today = new Date().toISOString().split('T')[0];
      const filename = `${logEntry.level}_${today}.log`;
      const filePath = path.join(this.logPath, filename);

      await fs.appendFile(filePath, logLine);

      // Log data for errors
      if (logEntry.level === 'error' && logEntry.data) {
        await fs.appendFile(
          filePath,
          JSON.stringify(logEntry.data, null, 2) + '\n'
        );
      }
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  private async logToDatabase(logEntry: LogEvent): Promise<void> {
    try {
      await connectDB();
      await LogEvent.create(logEntry);
    } catch (error) {
      console.error('Error writing to log database:', error);
    }
  }

  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.logPath, { recursive: true });
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();
