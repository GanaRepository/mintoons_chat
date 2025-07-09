// lib/security/rate-limiter.ts - API rate limiting
import { NextApiRequest, NextApiResponse } from 'next';
import { securityLogger } from './logger';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  keyGenerator?: (req: NextApiRequest) => string; // Function to generate a unique key
  headers?: boolean; // Whether to include rate limit headers
  skipFailedRequests?: boolean; // Whether to skip rate limiting for failed requests
  skipSuccessfulRequests?: boolean; // Whether to skip rate limiting for successful requests
  handler?: (req: NextApiRequest, res: NextApiResponse) => void; // Custom handler function
}

interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

// In-memory store for rate limits
// In production, you might want to use Redis or another shared cache
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class RateLimiter {
  private defaultOptions: RateLimitOptions = {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    headers: true,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  };

  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup timer
    this.cleanupTimer = setInterval(() => this.cleanupStore(), 60000);
  }

  /**
   * Create middleware for rate limiting
   */
  middleware(options?: Partial<RateLimitOptions>) {
    const opts = { ...this.defaultOptions, ...options };

    return async (
      req: NextApiRequest,
      res: NextApiResponse,
      next: () => void
    ) => {
      const key = opts.keyGenerator
        ? opts.keyGenerator(req)
        : this.defaultKeyGenerator(req);

      const rateLimitInfo = this.getRateLimitInfo(key, opts.windowMs, opts.max);

      // Set headers if enabled
      if (opts.headers) {
        res.setHeader('X-RateLimit-Limit', opts.max.toString());
        res.setHeader(
          'X-RateLimit-Remaining',
          rateLimitInfo.remaining.toString()
        );
        res.setHeader(
          'X-RateLimit-Reset',
          Math.ceil(rateLimitInfo.resetTime.getTime() / 1000).toString()
        );
      }

      // Check if rate limit exceeded
      if (rateLimitInfo.current > rateLimitInfo.limit) {
        // Log rate limit exceeded
        await securityLogger.security(
          'rate-limit',
          `Rate limit exceeded for ${key}`,
          {
            path: req.url,
            method: req.method,
            limit: opts.max,
            window: opts.windowMs,
          },
          undefined,
          req.socket.remoteAddress
        );

        // Use custom handler or default
        if (opts.handler) {
          return opts.handler(req, res);
        } else {
          return res.status(429).json({
            error: 'Too Many Requests',
            message:
              'You have exceeded the rate limit. Please try again later.',
          });
        }
      }

      // Continue to next middleware
      next();

      // Skip incrementing based on options
      res.on('finish', () => {
        if (
          (opts.skipFailedRequests && res.statusCode >= 400) ||
          (opts.skipSuccessfulRequests && res.statusCode < 400)
        ) {
          this.decrementCounter(key);
        }
      });
    };
  }

  /**
   * Check if a request is rate limited
   */
  isRateLimited(
    key: string,
    options?: Partial<RateLimitOptions>
  ): RateLimitInfo & { isLimited: boolean } {
    const opts = { ...this.defaultOptions, ...options };
    const info = this.getRateLimitInfo(key, opts.windowMs, opts.max);

    return {
      ...info,
      isLimited: info.current > info.limit,
    };
  }

  /**
   * Increment counter for a key
   */
  incrementCounter(
    key: string,
    windowMs: number = this.defaultOptions.windowMs
  ): void {
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return;
    }

    const record = rateLimitStore.get(key)!;

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitStore.set(key, record);
  }

  /**
   * Decrement counter for a key
   */
  decrementCounter(key: string): void {
    if (rateLimitStore.has(key)) {
      const record = rateLimitStore.get(key)!;
      record.count = Math.max(0, record.count - 1);
      rateLimitStore.set(key, record);
    }
  }

  /**
   * Reset counter for a key
   */
  resetCounter(key: string): void {
    rateLimitStore.delete(key);
  }

  /**
   * Create specific rate limiters for different routes or actions
   */
  createLimiter(
    options: Partial<RateLimitOptions>
  ): (req: NextApiRequest, res: NextApiResponse, next: () => void) => void {
    return this.middleware(options);
  }

  // Private helper methods

  private defaultKeyGenerator(req: NextApiRequest): string {
    return req.socket.remoteAddress || 'unknown';
  }

  private getRateLimitInfo(
    key: string,
    windowMs: number,
    max: number
  ): RateLimitInfo {
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      this.incrementCounter(key, windowMs);
      const record = rateLimitStore.get(key)!;

      return {
        limit: max,
        current: 1,
        remaining: max - 1,
        resetTime: new Date(record.resetTime),
      };
    }

    const record = rateLimitStore.get(key)!;

    // Reset if window expired
    if (now > record.resetTime) {
      this.incrementCounter(key, windowMs);
      const newRecord = rateLimitStore.get(key)!;

      return {
        limit: max,
        current: 1,
        remaining: max - 1,
        resetTime: new Date(newRecord.resetTime),
      };
    }

    // Increment counter
    this.incrementCounter(key, windowMs);
    const updatedRecord = rateLimitStore.get(key)!;

    return {
      limit: max,
      current: updatedRecord.count,
      remaining: Math.max(0, max - updatedRecord.count),
      resetTime: new Date(updatedRecord.resetTime),
    };
  }

  private cleanupStore(): void {
    const now = Date.now();

    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
