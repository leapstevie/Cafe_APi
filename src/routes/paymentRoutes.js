const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

router.post('/create', PaymentController.create);
router.get('/checkout', PaymentController.checkout);
router.post('/callback', PaymentController.callback);
router.get('/success', PaymentController.success);
router.get('/failed', PaymentController.failed);
router.get('/cancel', PaymentController.cancel);

module.exports = router;
