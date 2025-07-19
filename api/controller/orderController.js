const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Promotion = require('../models/promotion');
const createError = require('../util/errorHandle');

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

// Lấy tất cả đơn hàng
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

// Thêm một món ăn vào đơn hàng theo sessionId
exports.addItemToOrder = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { menuItemId, quantity, price } = req.body;

    if (!sessionId || !menuItemId || !quantity || !price) {
      return res.status(400).json({ error: 'Thiếu thông tin món ăn hoặc sessionId' });
    }

    let order = await Order.findOne({ sessionId, status: 'pending' });

    if (!order) {
      order = new Order({
        sessionId,
        status: 'pending',
        totalAmount: 0,
        paymentStatus: 'unpaid',
        orderTime: new Date()
      });
    }

    order.totalAmount += price * quantity;
    await order.save();

    const newItem = new OrderItem({
      orderId: order._id,
      menuItemId,
      quantity,
      price
    });
    await newItem.save();

    res.status(201).json({ message: 'Đã thêm món vào đơn hàng', order, item: newItem });
  } catch (err) {
    console.error("Lỗi khi thêm món lẻ:", err);
    res.status(500).json({ error: 'Không thể thêm món vào đơn hàng', details: err.message });
  }
};

// Lấy thống kê doanh thu tổng
exports.getRevenueStatistics = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period) {
      switch (period) {
        case 'today':
          dateFilter = { orderTime: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } };
          break;
        case 'week':
          dateFilter = { orderTime: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
          break;
        case 'month':
          dateFilter = { orderTime: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
          break;
        case 'year':
          dateFilter = { orderTime: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
          break;
        default:
          dateFilter = {};
      }
    }

    if (startDate && endDate) {
      dateFilter = {
        orderTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const pipeline = [
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
          maxOrderValue: { $max: '$totalAmount' },
          minOrderValue: { $min: '$totalAmount' }
        }
      }
    ];

    const result = await Order.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.json({
        success: true,
        data: {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          maxOrderValue: 0,
          minOrderValue: 0
        },
        period: period || 'all',
        dateFilter
      });
    }

    const stats = result[0];

    res.json({
      success: true,
      data: {
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        averageOrderValue: Math.round(stats.averageOrderValue || 0),
        maxOrderValue: stats.maxOrderValue || 0,
        minOrderValue: stats.minOrderValue || 0
      },
      period: period || 'all',
      dateFilter
    });

  } catch (err) {
    next(createError(500, 'Không thể lấy thống kê doanh thu', { cause: err }));
  }
};

// Lấy doanh thu từng ngày trong tháng
exports.getDailyRevenueInMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

    const pipeline = [
      {
        $match: {
          orderTime: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$orderTime' },
            month: { $month: '$orderTime' },
            year: { $year: '$orderTime' }
          },
          dailyRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          day: '$_id.day',
          month: '$_id.month',
          year: '$_id.year',
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          dailyRevenue: 1,
          orderCount: 1
        }
      }
    ];

    const dailyStats = await Order.aggregate(pipeline);

    const totalMonthlyRevenue = dailyStats.reduce((sum, day) => sum + day.dailyRevenue, 0);
    const totalOrders = dailyStats.reduce((sum, day) => sum + day.orderCount, 0);

    res.json({
      success: true,
      data: {
        month: targetMonth + 1,
        year: targetYear,
        totalMonthlyRevenue,
        totalOrders,
        dailyBreakdown: dailyStats
      }
    });

  } catch (err) {
    console.error('Error in getDailyRevenueInMonth:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy doanh thu theo ngày',
      error: err.message
    });
  }
};

exports.markAsPaidByCash = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This order has already been paid.' });
    }

    order.paymentStatus = 'paid';
    order.status = 'served';

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Successfully updated payment status.',
      data: updatedOrder
    });

  } catch (error) {
    console.error("Error during cash payment:", error);
    next(error);
  }
};
//Apply promotion to order
exports.applyVoucher = async (req, res, next) => {
  try {
      const { orderId } = req.params;
      const { voucherCode } = req.body;

      if (!voucherCode) {
          return res.status(400).json({ success: false, message: 'Vui lòng nhập mã voucher.' });
      }

      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
      }
      if (order.promotion_id) {
          return res.status(400).json({ success: false, message: 'Đơn hàng này đã được áp dụng khuyến mãi.' });
      }

      const promotion = await Promotion.findOne({ 
          code: voucherCode.toUpperCase(), 
          is_active: true,
          start_date: { $lte: new Date() }, 
          end_date: { $gte: new Date() }
      });

      if (!promotion) {
          return res.status(404).json({ success: false, message: 'Mã voucher không hợp lệ hoặc đã hết hạn.' });
      }

      // Tính toán lại tổng tiền từ các món ăn để đảm bảo chính xác
      const items = await OrderItem.find({ orderId: orderId });
      const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Kiểm tra điều kiện tối thiểu (nếu có)
      if (subTotal < promotion.min_order_amount) {
          return res.status(400).json({ success: false, message: `Đơn hàng phải có giá trị tối thiểu ${promotion.min_order_amount.toLocaleString('vi-VN')}₫ để áp dụng mã này.` });
      }

      let discountAmount = 0;
      if (promotion.discount_type === 'percentage') {
          discountAmount = subTotal * (promotion.discount_value / 100);
      } else { // fixed_amount
          discountAmount = promotion.discount_value;
      }

      // Cập nhật lại tổng tiền của đơn hàng
      order.totalAmount = subTotal - discountAmount;
      order.promotion_id = promotion._id; // Lưu lại ID của promotion đã áp dụng
      
      await order.save();

      res.status(200).json({
          success: true,
          message: 'Áp dụng voucher thành công!',
          data: {
              orderId: order._id,
              subTotal: subTotal,
              discount: discountAmount,
              newTotalAmount: order.totalAmount
          }
      });

  } catch (error) {
      next(error);
  }
};