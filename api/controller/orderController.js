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
            notes: item.notes,
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


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'sessionId',
        populate: {
          path: 'table',
          model: 'Table'
        }
      })
      .sort({ orderTime: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng', details: err.message });
  }
};
//  Thêm một món ăn vào đơn hàng theo sessionId
exports.addItemToOrder = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { menuItemId, quantity, price } = req.body;
  
      if (!sessionId || !menuItemId || !quantity || !price) {
        return res.status(400).json({ error: 'Thiếu thông tin món ăn hoặc sessionId' });
      }
  
      // 1. Tìm order với trạng thái pending trong session hiện tại
      let order = await Order.findOne({ sessionId, status: 'pending' });
  
      // 2. Nếu chưa có order thì tạo mới
      if (!order) {
        order = new Order({
          sessionId,
          status: 'pending',
          totalAmount: 0,
          paymentStatus: 'unpaid',
          orderTime: new Date()
        });
      }
  
      // 3. Tăng tổng tiền
      order.totalAmount += price * quantity;
      await order.save();
  
      // 4. Tạo món mới
      const newItem = new OrderItem({
        orderId: order._id,
        menuItemId,
        quantity,
        price
      });
      await newItem.save();
  
      res.status(201).json({ message: ' Đã thêm món vào đơn hàng', order, item: newItem });
    } catch (err) {
      console.error(" Lỗi khi thêm món lẻ:", err);
      res.status(500).json({ error: 'Không thể thêm món vào đơn hàng', details: err.message });
    }
  };
  