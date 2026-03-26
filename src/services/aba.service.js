const axios = require('axios');
const { generateABAHash, getReqTime } = require('./aba.helper');

async function createPayment(order) {
  const {
    ABA_MERCHANT_ID,
    ABA_API_KEY,
    ABA_SANDBOX_URL,
    RETURN_URL,
    CANCEL_URL
  } = process.env;

  const params = {
    req_time: getReqTime(),
    merchant_id: ABA_MERCHANT_ID,
    tran_id: order.tranId,
    firstname: order.firstname,
    lastname: order.lastname,
    email: order.email,
    phone: order.phone,
    amount: order.amount,
    currency: order.currency || 'USD',
    return_url: RETURN_URL,
    cancel_url: CANCEL_URL,
    callback_url: process.env.CALLBACK_URL, 
    payment_option: order.payment_option || 'abapay,cards',
    type: 'purchase',
  };

  const hash = generateABAHash(params, ABA_API_KEY);
  const form = new URLSearchParams({ ...params, hash });

  const endpoint = `${ABA_SANDBOX_URL.replace(/\/+$/, '')}/purchase`;
  const response = await axios.post(endpoint, form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data;
}

module.exports = { createPayment };
