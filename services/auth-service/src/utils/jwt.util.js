const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const generateAccessToken = (user) => {
    const jti = uuidv4();
    const token = jwt.sign(
        {
            jti,
            userId: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
    );
    return { token, jti };
};

const generateRefreshToken = (user) => {
    const jti = uuidv4();
    const token = jwt.sign(
        {
            jti,
            userId: user.id,
            type: 'refresh'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
    );
    return { token, jti };
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const decodeToken = (token) => {
    return jwt.decode(token);
};

const getTokenExpiresIn = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    getTokenExpiresIn
};
