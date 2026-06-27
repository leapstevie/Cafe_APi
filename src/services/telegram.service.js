const axios = require('axios');

function getTelegramApiUrl(method) {
  return `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
}

function getTelegramWebhookUrl() {
  const explicitBaseUrl = process.env.TELEGRAM_WEBHOOK_BASE_URL || process.env.APP_PUBLIC_URL;
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : null;
  const baseUrl = explicitBaseUrl || railwayDomain;

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, '')}/api/telegram/webhook`;
}

async function postToTelegram(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return null;
  }

  return axios.post(getTelegramApiUrl(method), payload);
}

async function sendTelegram(message) {
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
      return;
    }

    await postToTelegram('sendMessage', {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error('Telegram error:', err.message);
  }
}

async function sendWelcomeMessage(chatId) {
  await postToTelegram('sendMessage', {
    chat_id: chatId,
    text: [
      'hi Welcome !',
    ].join('\n')
  });
}

async function sendMiniAppStartButton(chatId) {
  const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL;

  if (!miniAppUrl) {
    throw new Error('TELEGRAM_MINI_APP_URL is not configured');
  }

  await postToTelegram('sendMessage', {
    chat_id: chatId,
    text: 'Welcome to Cafe Bong! Tap the button below to open the mini app.',
    reply_markup: {
      inline_keyboard: [[
        {
          text: 'Open Cafe Mini App',
          web_app: {
            url: miniAppUrl
          }
        }
      ]]
    }
  });
}

function isStartCommand(text) {
  return /^\/start(?:@[\w_]+)?(?:\s.*)?$/i.test(text);
}

async function getWebhookInfo() {
  const response = await postToTelegram('getWebhookInfo', {});
  return response?.data?.result || null;
}

async function registerTelegramWebhook() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return null;
  }

  const webhookUrl = getTelegramWebhookUrl();
  if (!webhookUrl) {
    console.log('Telegram webhook skipped: no public base URL configured yet');
    return null;
  }

  const currentWebhook = await getWebhookInfo();
  if (currentWebhook?.url === webhookUrl) {
    console.log(`Telegram webhook already set: ${webhookUrl}`);
    return currentWebhook;
  }

  const payload = {
    url: webhookUrl,
    allowed_updates: ['message']
  };

  if (process.env.TELEGRAM_WEBHOOK_SECRET) {
    payload.secret_token = process.env.TELEGRAM_WEBHOOK_SECRET;
  }

  const response = await postToTelegram('setWebhook', payload);
  console.log(`Telegram webhook set: ${webhookUrl}`);
  return response?.data?.result || null;
}

async function handleTelegramUpdate(update) {
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();

  if (!chatId || !text) {
    return;
  }

  if (isStartCommand(text)) {
    await sendWelcomeMessage(chatId);
    await sendMiniAppStartButton(chatId);
  }
}

module.exports = {
  sendTelegram,
  sendMiniAppStartButton,
  handleTelegramUpdate,
  registerTelegramWebhook
};
