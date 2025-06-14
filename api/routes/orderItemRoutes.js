const express = require('express');
const router = express.Router();
const orderItemController = require('../controller/orderItemController');
const orderController = require('../controller/orderController');

router.post('/', orderItemController.createOrderItem);
router.get('/order/:orderId', orderItemController.getItemsByOrder);
router.put('/:id/status', orderItemController.updateOrderItemStatus);
router.post('/:sessionId/items', orderController.addItemToOrder);

module.exports = router;
