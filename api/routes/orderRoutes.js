// const express = require('express');
// const router = express.Router();
// const orderController = require('../controller/orderController');

// router.post('/', orderController.createOrder);
// router.get('/session/:sessionId', orderController.getOrdersBySession);
// router.put('/:id/status', orderController.updateOrderStatus);

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Order = require('../models/order'); // hoặc đường dẫn đúng của model
// const OrderItem = require('../models/orderItem'); // nếu có

// // GET all orders
// router.get('/', async (req, res) => {
//   try {
//     const orders = await Order.find().lean(); // lấy toàn bộ đơn hàng
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

// POST: Tạo đơn hàng mới
router.post('/', async (req, res) => {
  try {
    const { sessionId, items } = req.body;

    // Tính tổng tiền
    const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Tạo đơn hàng
    const newOrder = new Order({
      sessionId,
      status: 'pending',
      totalAmount,
      paymentStatus: 'unpaid',
      orderTime: new Date(),
    });

    const savedOrder = await newOrder.save();

    // Tạo từng item
    const orderItems = await Promise.all(
      items.map((item) => {
        const newItem = new OrderItem({
          orderId: savedOrder._id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        });
        return newItem.save();
      })
    );

    res.status(201).json({ order: savedOrder, items: orderItems });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tạo đơn hàng', details: err.message });
  }
});

// GET: Lấy đơn hàng theo sessionId
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const orders = await Order.find({ sessionId }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy đơn hàng theo session' });
  }
});

// PUT: Cập nhật trạng thái đơn hàng
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng' });
  }
});

// GET: Lấy tất cả đơn hàng
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng' });
  }
});

module.exports = router;
