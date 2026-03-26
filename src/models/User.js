const db = require('../config/database');

class User {
    // Create new user
    static async create(username, email, hashedPassword) {
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Save access token to database
    static async saveAccessToken(userId, token) {
        await db.query(
            'UPDATE users SET access_token = ? WHERE id = ?',
            [token, userId]
        );
    }

    // Find user by access token
    static async findByAccessToken(token) {
        const [rows] = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE access_token = ?',
            [token]
        );
        return rows[0];
    }

    // Delete access token (logout)
    static async deleteAccessToken(userId) {
        await db.query(
            'UPDATE users SET access_token = NULL WHERE id = ?',
            [userId]
        );
    }

    // Find user by ID
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Find user by username
    static async findByUsername(username) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }
}

module.exports = User;
