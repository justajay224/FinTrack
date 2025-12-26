// Redis Connection Test Script
// Run with: node test-redis.js

require('dotenv').config();
const Redis = require('ioredis');

async function testConnection() {
    console.log('Testing Redis connection...');
    console.log(`URL: ${process.env.REDIS_URL ? 'Using REDIS_URL' : 'Using HOST:PORT'}`);

    let redis;

    if (process.env.REDIS_URL) {
        console.log('Connecting to Redis Cloud...');
        // Try without TLS first (most Redis Cloud instances don't require it)
        redis = new Redis(process.env.REDIS_URL, {
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3
        });
    } else {
        redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined
        });
    }

    redis.on('error', (err) => {
        console.error('❌ Redis Connection error:', err.message);
    });

    try {
        // Test ping first
        const pong = await redis.ping();
        console.log(`✅ PING response: ${pong}`);

        // Test set
        await redis.set('test_key', 'Hello from Financial Tracker!');
        console.log('✅ SET command successful');

        // Test get
        const value = await redis.get('test_key');
        console.log(`✅ GET command successful: ${value}`);

        // Test delete
        await redis.del('test_key');
        console.log('✅ DEL command successful');

        console.log('\n🎉 Redis connection successful!');

        await redis.quit();
        process.exit(0);
    } catch (error) {
        console.error('❌ Redis test failed:', error.message);
        process.exit(1);
    }
}

testConnection();
