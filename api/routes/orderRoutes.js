// // const express = require('express');
// // const router = express.Router();
// // const orderController = require('../controller/orderController');

// // router.post('/', orderController.createOrder);
// // router.get('/session/:sessionId', orderController.getOrdersBySession);
// // router.put('/:id/status', orderController.updateOrderStatus);

// // module.exports = router;


// // const express = require('express');
// // const router = express.Router();
// // const Order = require('../models/order'); // hoặc đường dẫn đúng của model
// // const OrderItem = require('../models/orderItem'); // nếu có

// // // GET all orders
// // router.get('/', async (req, res) => {
// //   try {
// //     const orders = await Order.find().lean(); // lấy toàn bộ đơn hàng
// //     res.json(orders);
// //   } catch (err) {
// //     res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng' });
// //   }
// // });

// // module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Order = require('../models/order');
// const OrderItem = require('../models/orderItem');

// // POST: Tạo đơn hàng mới
// router.post('/', async (req, res) => {
//   try {
//     const { sessionId, items } = req.body;

//     // Tính tổng tiền
//     const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

//     // Tạo đơn hàng
//     const newOrder = new Order({
//       sessionId,
//       status: 'pending',
//       totalAmount,
//       paymentStatus: 'unpaid',
//       orderTime: new Date(),
//     });

//     const savedOrder = await newOrder.save();

//     // Tạo từng item
//     const orderItems = await Promise.all(
//       items.map((item) => {
//         const newItem = new OrderItem({
//           orderId: savedOrder._id,
//           menuItemId: item.menuItemId,
//           quantity: item.quantity,
//           price: item.price,
//         });
//         return newItem.save();
//       })
//     );

//     res.status(201).json({ order: savedOrder, items: orderItems });
//   } catch (err) {
//     res.status(500).json({ error: 'Không thể tạo đơn hàng', details: err.message });
//   }
// });

// // // GET: Lấy đơn hàng theo sessionId
// // router.get('/session/:sessionId', async (req, res) => {
// //   try {
// //     const { sessionId } = req.params;
// //     const orders = await Order.find({ sessionId }).lean();
// //     res.json(orders);
// //   } catch (err) {
// //     res.status(500).json({ error: 'Không thể lấy đơn hàng theo session' });
// //   }
// // });
// // GET: Lấy đơn hàng theo sessionId, kèm theo các orderItems
// router.get('/session/:sessionId', async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     // Lấy tất cả các đơn hàng theo sessionId
//     const orders = await Order.find({ sessionId }).lean();

//     if (!orders.length) {
//       return res.status(404).json({ message: 'Không có đơn hàng nào trong phiên này.' });
//     }

//     const orderIds = orders.map(order => order._id);

//     // Lấy tất cả orderItems liên quan
//     const orderItems = await OrderItem.find({ orderId: { $in: orderIds } })
//       .populate('menuItemId') // Optional: lấy thông tin món ăn
//       .lean();

//     // Gộp items theo orderId
//     const itemMap = {};
//     orderItems.forEach(item => {
//       const key = item.orderId.toString();
//       if (!itemMap[key]) itemMap[key] = [];
//       itemMap[key].push(item);
//     });

//     // Gắn items vào mỗi order
//     const ordersWithItems = orders.map(order => ({
//       ...order,
//       items: itemMap[order._id.toString()] || []
//     }));

//     res.json(ordersWithItems);
//   } catch (err) {
//     console.error('❌ Lỗi lấy order theo session:', err);
//     res.status(500).json({ error: 'Không thể lấy đơn hàng theo session', details: err.message });
//   }
// });

// // PUT: Cập nhật trạng thái đơn hàng
// router.put('/:id/status', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
//     res.json(updatedOrder);
//   } catch (err) {
//     res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng' });
//   }
// });

// // GET: Lấy tất cả đơn hàng
// router.get('/', async (req, res) => {
//   try {
//     const orders = await Order.find().lean();
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

// POST: Tạo đơn hàng mới hoặc thêm vào đơn đang chờ
router.post('/', async (req, res) => {
  try {
    const { sessionId, items } = req.body;

    if (!sessionId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Thiếu sessionId hoặc danh sách items' });
    }

    // 👉 Tính tổng tiền của items mới
    const newAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // ✅ Kiểm tra đã có đơn pending trong session chưa
    let order = await Order.findOne({ sessionId, status: 'pending' });

    if (order) {
      // cập nhật đơn cũ + thêm item
      order.totalAmount += newAmount;
      await order.save();

      const newItems = await Promise.all(
        items.map(item => {
          const newItem = new OrderItem({
            orderId: order._id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          });
          return newItem.save();
        })
      );

      return res.json({ message: 'Đã thêm món vào hóa đơn hiện tại', order, items: newItems });
    } else {
      // 👉 Nếu chưa: tạo đơn mới
      const newOrder = new Order({
        sessionId,
        status: 'pending',
        totalAmount: newAmount,
        paymentStatus: 'unpaid',
        orderTime: new Date(),
      });

      const savedOrder = await newOrder.save();

      const newItems = await Promise.all(
        items.map(item => {
          const newItem = new OrderItem({
            orderId: savedOrder._id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          });
          return newItem.save();
        })
      );

      return res.status(201).json({ message: 'Đã tạo hóa đơn mới', order: savedOrder, items: newItems });
    }
  } catch (err) {
    console.error("❌ Lỗi tạo/append đơn hàng:", err);
    res.status(500).json({ error: 'Không thể xử lý đơn hàng', details: err.message });
  }
});

// GET: Lấy đơn hàng theo sessionId, kèm theo các orderItems
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Lấy tất cả các đơn hàng theo sessionId
    const orders = await Order.find({ sessionId }).lean();

    if (!orders.length) {
      return res.status(404).json({ message: 'Không có đơn hàng nào trong phiên này.' });
    }

    const orderIds = orders.map(order => order._id);

    // Lấy tất cả orderItems liên quan
    const orderItems = await OrderItem.find({ orderId: { $in: orderIds } })
      .populate('menuItemId') // Optional: lấy thông tin món ăn
      .lean();

    // Gộp items theo orderId
    const itemMap = {};
    orderItems.forEach(item => {
      const key = item.orderId.toString();
      if (!itemMap[key]) itemMap[key] = [];
      itemMap[key].push(item);
    });

    // Gắn items vào mỗi order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: itemMap[order._id.toString()] || []
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error('❌ Lỗi lấy order theo session:', err);
    res.status(500).json({ error: 'Không thể lấy đơn hàng theo session', details: err.message });
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
