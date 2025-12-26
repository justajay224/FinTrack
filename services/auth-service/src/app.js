require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB, sequelize } = require('./config/database');
const { redis } = require('./config/redis');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorResponse } = require('./utils/response.util');

// Import routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');

const app = express();
const PORT = process.env.PORT || 4001;

// Trust proxy for Docker/Nginx
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting for all API routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Auth Service is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
    return errorResponse(res, 'Route not found', 404);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    return errorResponse(res, 'Internal server error', 500);
});

// Start server
const startServer = async () => {
    try {
        // Connect to MySQL
        await connectDB();

        // Sync database (development only)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Database synchronized');
        }

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Auth Service running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
