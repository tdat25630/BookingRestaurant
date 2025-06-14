const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

// Tạo đơn hàng mới hoặc thêm vào đơn pending
exports.createOrUpdateOrder = async (req, res) => {
  try {
    const { sessionId, items } = req.body;

    if (!sessionId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Thiếu sessionId hoặc danh sách items' });
    }

    const newAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    let order = await Order.findOne({ sessionId, status: 'pending' });

    if (order) {
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
};

// Lấy đơn hàng theo sessionId và các orderItems
exports.getOrdersBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const orders = await Order.find({ sessionId }).lean();

    if (!orders.length) {
      return res.status(404).json({ message: 'Không có đơn hàng nào trong phiên này.' });
    }

    const orderIds = orders.map(order => order._id);
    const orderItems = await OrderItem.find({ orderId: { $in: orderIds } })
      .populate('menuItemId')
      .lean();

    const itemMap = {};
    orderItems.forEach(item => {
      const key = item.orderId.toString();
      if (!itemMap[key]) itemMap[key] = [];
      itemMap[key].push(item);
    });

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: itemMap[order._id.toString()] || []
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error('❌ Lỗi lấy order theo session:', err);
    res.status(500).json({ error: 'Không thể lấy đơn hàng theo session', details: err.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng', details: err.message });
  }
};

// Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng', details: err.message });
  }
};
