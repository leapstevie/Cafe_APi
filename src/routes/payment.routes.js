const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

router.post('/create', PaymentController.create);
router.post('/callback', PaymentController.callback);
router.get('/checkout', PaymentController.checkout);
router.get('/success', PaymentController.success);
router.get('/failed', PaymentController.failed);
router.get('/cancel', PaymentController.cancel);

module.exports = router;
