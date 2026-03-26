const { createPayment } = require('../services/aba.service');
const { generateABAHash } = require('../services/aba.helper');
const { sendTelegram } = require('../services/telegram.service');

class PaymentController {
  static async create(req, res) {
    try {
      const order = {
        tranId: `TXN_${Date.now()}`,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        amount: req.body.amount,
        currency: req.body.currency || 'USD',
        payment_option: req.body.payment_option || 'abapay,cards',
      };
      const result = await createPayment(order);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async checkout(req, res) {
    try {
      const order = {
        tranId: `TXN_${Date.now()}`,
        firstname: req.query.firstname || 'Guest',
        lastname: req.query.lastname || '',
        email: req.query.email || '',
        phone: req.query.phone || '',
        amount: req.query.amount,
        currency: req.query.currency || 'USD',
        payment_option: req.query.payment_option || 'abapay,cards',
      };
      const html = await createPayment(order);
      res.type('html').send(html);
    } catch (err) {
      res.status(500).send('Unable to start checkout');
    }
  }

  static async callback(req, res) {
    const { ABA_API_KEY } = process.env;
    const body = req.body || {};
    const { hash: receivedHash, ...params } = body;
    try {
      const expectedHash = generateABAHash(params, ABA_API_KEY);
      if (expectedHash !== receivedHash) {
        console.error('Hash mismatch');
        return res.status(400).send('Invalid hash');
      }

      const { tran_id, status, amount, firstname } = body;
      if (status === '00') {
        await sendTelegram(
          `✅ <b>Payment Success!</b>\n👤 ${firstname}\n💰 $${amount}\n🔖 Tran ID: ${tran_id}`
        );
        return res.redirect('/payment/success');
      } else {
        await sendTelegram(
          `❌ <b>Payment Failed!</b>\n👤 ${firstname}\n💰 $${amount}\n🔖 Tran ID: ${tran_id}\n⚠️ Code: ${status}`
        );
        return res.redirect('/payment/failed');
      }
    } catch (err) {
      console.error('Callback error:', err.message);
      res.status(500).send('Server error');
    }
  }

  static async success(req, res) {
    res.send('🎉 Payment successful!');
  }

  static async failed(req, res) {
    res.send('❌ Payment failed. Please try again.');
  }

  static async cancel(req, res) {
    res.send('🚫 Payment cancelled.');
  }
}

module.exports = PaymentController;
