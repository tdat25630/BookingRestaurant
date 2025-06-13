const express = require('express');
const router = express.Router();
const orderItemController = require('../controller/orderItemController');

router.post('/', orderItemController.createOrderItem);
router.get('/order/:orderId', orderItemController.getItemsByOrder);
router.put('/:id/status', orderItemController.updateOrderItemStatus);

module.exports = router;
