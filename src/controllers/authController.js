const AuthService = require('../services/authService');

class AuthController {
    // POST /api/auth/register
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email, and password are required' });
            }

            const result = await AuthService.register(username, email, password);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // POST /api/auth/login
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await AuthService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    // POST /api/auth/logout
    static async logout(req, res) {
        try {
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/auth/user/:id
    static async getUserInfo(req, res) {
        try {
            const userId = req.params.id;
            const user = await AuthService.getUserInfo(userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}

module.exports = AuthController;
