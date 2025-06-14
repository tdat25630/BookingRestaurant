const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

router.post('/', orderController.createOrUpdateOrder);
router.get('/session/:sessionId', orderController.getOrdersBySession);
router.put('/:id/status', orderController.updateOrderStatus);
router.get('/', orderController.getAllOrders);

module.exports = router;
