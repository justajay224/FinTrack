const Redis = require('ioredis');
require('dotenv').config();

// Support both REDIS_URL and individual config
let redis;

if (process.env.REDIS_URL) {
    // Connect using URL (without TLS for Redis Labs free tier)
    redis = new Redis(process.env.REDIS_URL, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
    });
} else {
    redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
    });
}

redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});

// Token blacklist functions
const blacklistToken = async (jti, expiresInSeconds) => {
    await redis.setex(`blacklist:${jti}`, expiresInSeconds, '1');
};

const isTokenBlacklisted = async (jti) => {
    const result = await redis.get(`blacklist:${jti}`);
    return result === '1';
};

module.exports = { redis, blacklistToken, isTokenBlacklisted };
