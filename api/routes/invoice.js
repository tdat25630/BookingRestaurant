const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/invoiceController');

router.get('/preview/:orderId', invoiceController.previewInvoice);
router.get('/vnpay_return', invoiceController.handleVnpayReturn);
router.get('/vnpay_ipn', invoiceController.handleVnpayIpn);

router.post('/create-payment-url', invoiceController.createVnpayUrl);


module.exports = router;
