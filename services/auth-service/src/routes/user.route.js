const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { passwordLimiter } = require('../middlewares/rateLimiter.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
    updateProfileValidation,
    changePasswordValidation
} = require('../validations/auth.validation');

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', userController.getProfile);

router.put(
    '/profile',
    updateProfileValidation,
    validate,
    userController.updateProfile
);

// Password route with stricter rate limiting
router.put(
    '/password',
    passwordLimiter,
    changePasswordValidation,
    validate,
    userController.changePassword
);

// Delete account
router.delete('/account', userController.deleteAccount);

module.exports = router;
