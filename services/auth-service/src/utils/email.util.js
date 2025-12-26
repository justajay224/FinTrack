const dns = require('dns').promises;

/**
 * Validate email format and check if domain has MX records
 * @param {string} email - Email address to validate
 * @returns {Promise<{valid: boolean, message: string}>}
 */
const validateEmail = async (email) => {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format' };
    }

    // Extract domain from email
    const domain = email.split('@')[1];

    try {
        // Check if domain has MX records
        const mxRecords = await dns.resolveMx(domain);
        if (mxRecords && mxRecords.length > 0) {
            return { valid: true, message: 'Email is valid' };
        }
        return { valid: false, message: 'Email domain does not accept emails' };
    } catch (error) {
        // If DNS lookup fails, domain likely doesn't exist
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            return { valid: false, message: 'Email domain does not exist' };
        }
        // For other errors, we'll allow the email (could be network issue)
        console.warn('Email validation DNS error:', error.message);
        return { valid: true, message: 'Email format is valid (domain check skipped)' };
    }
};

module.exports = { validateEmail };
