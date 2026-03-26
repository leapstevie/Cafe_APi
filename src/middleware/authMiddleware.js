const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and check if it exists in database
const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

        // Check if token exists in database (not logged out)
        const user = await User.findByAccessToken(token);
        if (!user) {
            return res.status(401).json({ error: 'Token has been invalidated. Please login again.' });
        }

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            token: token
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Require user to be authenticated
const requireAuth = (req, res, next) => {
    verifyToken(req, res, next);
};

module.exports = {
    verifyToken,
    requireAuth
};
