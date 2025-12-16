import { createClient, RedisClientType } from 'redis';

export class RateLimiter {
  private client: RedisClientType | null = null;
  private inMemoryStore: Map<string, { count: number; resetAt: number }> = new Map();
  private useRedis: boolean;

  constructor() {
    this.useRedis = !!process.env.REDIS_URL;
    
    if (this.useRedis) {
      this.initRedis();
    } else {
      console.log('⚠️  Redis not configured, using in-memory rate limiting');
    }
  }

  private async initRedis() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL,
      });

      this.client.on('error', (err) => {
        console.error('Redis error:', err);
        this.useRedis = false;
      });

      await this.client.connect();
      console.log('✅ Connected to Redis for rate limiting');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.useRedis = false;
    }
  }

  /**
   * Check if identity is within rate limits
   */
  async checkLimit(identity: string): Promise<boolean> {
    const maxPerMinute = parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10');
    const maxPerHour = parseInt(process.env.MAX_REQUESTS_PER_HOUR || '100');

    // Check minute limit
    const minuteKey = `ratelimit:minute:${identity}`;
    const minuteCount = await this.getCount(minuteKey);
    
    if (minuteCount >= maxPerMinute) {
      console.log(`⚠️  Rate limit exceeded for ${identity} (minute)`);
      return false;
    }

    // Check hour limit
    const hourKey = `ratelimit:hour:${identity}`;
    const hourCount = await this.getCount(hourKey);
    
    if (hourCount >= maxPerHour) {
      console.log(`⚠️  Rate limit exceeded for ${identity} (hour)`);
      return false;
    }

    return true;
  }

  /**
   * Record a transaction for rate limiting
   */
  async recordUsage(identity: string): Promise<void> {
    const minuteKey = `ratelimit:minute:${identity}`;
    const hourKey = `ratelimit:hour:${identity}`;

    await this.increment(minuteKey, 60); // 1 minute TTL
    await this.increment(hourKey, 3600); // 1 hour TTL
  }

  /**
   * Get count from Redis or in-memory store
   */
  private async getCount(key: string): Promise<number> {
    if (this.useRedis && this.client) {
      try {
        const value = await this.client.get(key);
        return value ? parseInt(value) : 0;
      } catch (error) {
        console.error('Redis get error:', error);
        return this.getInMemory(key);
      }
    } else {
      return this.getInMemory(key);
    }
  }

  /**
   * Increment count in Redis or in-memory store
   */
  private async increment(key: string, ttl: number): Promise<void> {
    if (this.useRedis && this.client) {
      try {
        await this.client.incr(key);
        await this.client.expire(key, ttl);
      } catch (error) {
        console.error('Redis increment error:', error);
        this.incrementInMemory(key, ttl);
      }
    } else {
      this.incrementInMemory(key, ttl);
    }
  }

  /**
   * In-memory fallback for rate limiting
   */
  private getInMemory(key: string): number {
    const entry = this.inMemoryStore.get(key);
    
    if (!entry) {
      return 0;
    }

    // Check if expired
    if (Date.now() > entry.resetAt) {
      this.inMemoryStore.delete(key);
      return 0;
    }

    return entry.count;
  }

  /**
   * Increment in-memory counter
   */
  private incrementInMemory(key: string, ttl: number): void {
    const entry = this.inMemoryStore.get(key);
    const resetAt = Date.now() + (ttl * 1000);

    if (!entry || Date.now() > entry.resetAt) {
      this.inMemoryStore.set(key, { count: 1, resetAt });
    } else {
      entry.count++;
    }

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanupExpired();
    }
  }

  /**
   * Clean up expired in-memory entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.inMemoryStore.entries()) {
      if (now > entry.resetAt) {
        this.inMemoryStore.delete(key);
      }
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}

