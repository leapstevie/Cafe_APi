require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');
const { registerTelegramWebhook } = require('./src/services/telegram.service');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Test database connection
        await db.query('SELECT 1');
        console.log('✓ Database connected successfully');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
            registerTelegramWebhook().catch((error) => {
                console.error('Telegram webhook registration failed:', error.message);
            });
        });
    } catch (error) {
        console.error('✗ Failed to start server:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', error);
        process.exit(1);
    }
}

startServer();
