const { handleTelegramUpdate } = require('../services/telegram.service');

class TelegramController {
  static async webhook(req, res) {
    try {
      const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
      const receivedSecret = req.get('x-telegram-bot-api-secret-token');

      if (expectedSecret && expectedSecret !== receivedSecret) {
        return res.status(403).json({ error: 'Invalid Telegram webhook secret' });
      }

      await handleTelegramUpdate(req.body);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Telegram webhook error:', error.message);
      return res.status(200).json({ ok: false });
    }
  }
}

module.exports = TelegramController;
