const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/invoiceController');

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceDetails);
// router.get('/:id/print', invoiceController.printInvoice);
router.put('/:id/cancel', invoiceController.cancelInvoice);

module.exports = router;
