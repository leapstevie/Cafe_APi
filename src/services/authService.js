const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
    // Register new user
    static async register(username, email, password) {
        // Check if user already exists
        const existingUserByEmail = await User.findByEmail(email);
        if (existingUserByEmail) {
            throw new Error('Email already registered');
        }

        const existingUserByUsername = await User.findByUsername(username);
        if (existingUserByUsername) {
            throw new Error('Username already taken');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await User.create(username, email, hashedPassword);

        // Generate JWT token
        const token = this.generateToken(userId);

        // Save token to database
        await User.saveAccessToken(userId, token);

        // Get user info (without password)
        const user = await User.findById(userId);

        return { user, token };
    }

    // Login user
    static async login(email, password) {
        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Generate token
        const token = this.generateToken(user.id);

        // Save token to database
        await User.saveAccessToken(user.id, token);

        // Remove password from response
        delete user.password;

        return { user, token };
    }

    // Get user by ID
    static async getUserById(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    // Logout user (invalidate token)
    static async logout(userId) {
        await User.deleteAccessToken(userId);
        return { message: 'Logged out successfully' };
    }

    // Verify access token from database
    static async verifyAccessToken(token) {
        const user = await User.findByAccessToken(token);
        if (!user) {
            throw new Error('Invalid or expired token');
        }
        return user;
    }

    // Generate JWT token
    static generateToken(userId) {
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );
    }
}

module.exports = AuthService;
