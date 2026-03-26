const crypto = require('crypto');

function generateABAHash(params, apiKey) {
  const sortedKeys = Object.keys(params).sort();
  const raw = sortedKeys.map(k => params[k]).join('') + apiKey;
  return crypto.createHash('sha512').update(raw).digest('base64');
}

function getReqTime() {
  const now = new Date();
  const YYYY = now.getFullYear().toString();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
}

module.exports = { generateABAHash, getReqTime };
