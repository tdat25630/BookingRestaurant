const Order = require('../models/order');
const OrderItem = require('../models/orderItem');


// exports.createOrder = async (req, res) => {
//   try {
//     // const { diningSession, totalAmount } = req.body;

//     // const order = new Order({ diningSession, totalAmount });

//     const { sessionId, totalAmount } = req.body;

// const order = new Order({ sessionId, totalAmount });

//     await order.save();

//     res.status(201).json(order);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.createOrder = async (req, res) => {
  try {
    const { sessionId, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // Tính tổng tiền
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Tạo đơn hàng
    const order = new Order({ sessionId, totalAmount });
    await order.save();

    // Tạo danh sách OrderItem
    const orderItems = items.map(item => ({
      orderId: order._id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.price
    }));

    await OrderItem.insertMany(orderItems);

    res.status(201).json({ order, items: orderItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrdersBySession = async (req, res) => {
  try {
    const orders = await Order.find({ diningSession: req.params.sessionId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
