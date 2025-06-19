const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/invoiceController');

router.get('/preview/:orderId', invoiceController.previewInvoice);
router.post('/create-vnpay-url', invoiceController.createVnpayUrl);
router.get('/vnpay_return', invoiceController.handleVnpayReturn);
router.get('/vnpay_ipn', invoiceController.handleVnpayIpn);


module.exports = router;