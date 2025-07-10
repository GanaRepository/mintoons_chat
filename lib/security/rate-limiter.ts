// lib/security/rate-limiter.ts - Redis-based rate limiter
import { createClient } from 'redis';
import { NextApiRequest, NextApiResponse } from 'next';
import { securityLogger } from './logger';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: NextApiRequest) => string;
  headers?: boolean;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  handler?: (req: NextApiRequest, res: NextApiResponse) => void;
  prefix?: string;
}

interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

export class RateLimiter {
  private redis: any;
  private defaultOptions: RateLimitOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '60'),
    headers: true,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    prefix: 'rate_limit',
  };

  constructor() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.redis.on('error', (error: Error) => {
      console.error('Redis rate limiter error:', error);
    });

    this.redis.connect().catch(console.error);
  }

  middleware(options?: Partial<RateLimitOptions>) {
    const opts = { ...this.defaultOptions, ...options };

    return async (
      req: NextApiRequest,
      res: NextApiResponse,
      next: () => void
    ) => {
      try {
        const key = opts.keyGenerator
          ? opts.keyGenerator(req)
          : this.defaultKeyGenerator(req);
        const rateLimitInfo = await this.getRateLimitInfo(key, opts);

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

        if (rateLimitInfo.current > rateLimitInfo.limit) {
          await securityLogger.security(
            'rate-limit',
            `Rate limit exceeded for ${key}`,
            {
              path: req.url,
              method: req.method,
              limit: opts.max,
              current: rateLimitInfo.current,
            }
          );

          return res.status(429).json({
            error: 'Too Many Requests',
            message:
              'You have exceeded the rate limit. Please try again later.',
          });
        }

        next();
      } catch (error) {
        console.error('Rate limiter error:', error);
        next();
      }
    };
  }

  createLimiter(options: Partial<RateLimitOptions>) {
    return this.middleware(options);
  }

  private defaultKeyGenerator(req: NextApiRequest): string {
    return req.socket.remoteAddress || 'unknown';
  }

  private async getRateLimitInfo(
    key: string,
    options: RateLimitOptions
  ): Promise<RateLimitInfo> {
    try {
      const redisKey = `${options.prefix}:${key}`;
      const windowSeconds = Math.ceil(options.windowMs / 1000);

      const multi = this.redis.multi();
      multi.incr(redisKey);
      multi.expire(redisKey, windowSeconds);

      const results = await multi.exec();
      const current = results[0] || 0;

      return {
        limit: options.max,
        current,
        remaining: Math.max(0, options.max - current),
        resetTime: new Date(Date.now() + options.windowMs),
      };
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      return {
        limit: options.max,
        current: 0,
        remaining: options.max,
        resetTime: new Date(Date.now() + options.windowMs),
      };
    }
  }
}

export const rateLimiter = new RateLimiter();
