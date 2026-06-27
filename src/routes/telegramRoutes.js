const express = require('express');
const router = express.Router();
const TelegramController = require('../controllers/telegramController');

router.post('/webhook', TelegramController.webhook);

module.exports = router;
