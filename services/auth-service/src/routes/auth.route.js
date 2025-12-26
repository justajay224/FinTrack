const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
    registerValidation,
    loginValidation,
    refreshTokenValidation
} = require('../validations/auth.validation');

// Public routes with rate limiting
router.post(
    '/register',
    authLimiter,
    registerValidation,
    validate,
    authController.register
);

router.post(
    '/login',
    authLimiter,
    loginValidation,
    validate,
    authController.login
);

router.post(
    '/refresh',
    refreshTokenValidation,
    validate,
    authController.refreshToken
);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
