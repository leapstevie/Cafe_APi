const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// POST /api/auth/register - Admin only user creation
router.post('/register', requireAuth, requireAdmin, AuthController.register);

// POST /api/auth/login - User login
router.post('/login', AuthController.login);

// POST /api/auth/logout - User logout (requires authentication)
router.post('/logout', requireAuth, AuthController.logout);

// GET /api/auth/user/:id - Get user info
router.get('/user/:id', AuthController.getUserInfo);

module.exports = router;
