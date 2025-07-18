// const Order = require('../models/order');
// const OrderItem = require('../models/orderItem');

// // Lấy danh sách đơn hàng cho Chef (chỉ pending và preparing)
// // exports.getOrdersForChef = async (req, res) => {
// //   try {
// //     const { status, limit = 20, page = 1 } = req.query;
    
// //     // Chef chỉ cần xem đơn hàng pending và preparing
// //     const validStatuses = ['pending', 'preparing'];
// //     let statusFilter = validStatuses;
    
// //     if (status && validStatuses.includes(status)) {
// //       statusFilter = [status];
// //     }

// //     const skip = (page - 1) * limit;
    
// //     // Lấy orders với populate session info
// //     const orders = await Order.find({ 
// //       status: { $in: statusFilter }
// //       // Bỏ điều kiện paymentStatus - Chef cần thấy tất cả đơn để nấu
// //     })
// //     .populate('sessionId', 'tableNumber customerName')
    
// //     .sort({ orderTime: 1 }) // Sắp xếp theo thời gian đặt (cũ nhất trước)
// //     .limit(parseInt(limit))
// //     .skip(skip)
// //     .lean();

// //     if (!orders.length) {
// //       return res.json({ 
// //         orders: [], 
// //         message: 'Không có đơn hàng nào cần xử lý',
// //         totalCount: 0,
// //         currentPage: parseInt(page),
// //         totalPages: 0
// //       });
// //     }


// // Lấy danh sách đơn hàng cho Chef (chỉ pending và preparing)
// exports.getOrdersForChef = async (req, res) => {
//   try {
//     const { status, limit = 20, page = 1 } = req.query;
    
//     // Chef chỉ cần xem đơn hàng pending và preparing
//     const validStatuses = ['pending', 'preparing'];
//     let statusFilter = validStatuses;
    
//     if (status && validStatuses.includes(status)) {
//       statusFilter = [status];
//     }

//     const skip = (page - 1) * limit;
    
//     // Lấy orders với populate session info VÀ table info
//     const orders = await Order.find({ 
//       status: { $in: statusFilter }
//     })
//     .populate({
//       path: 'sessionId',
//       populate: {
//         path: 'table',
//         model: 'Table'
//       }
//     })
//     .populate('items') // Nếu cần populate OrderItems
//     .sort({ orderTime: 1 }) // Chef thường xem đơn cũ trước
//     .limit(parseInt(limit))
//     .skip(skip)
//     .lean();

//     const total = await Order.countDocuments({ 
//       status: { $in: statusFilter }
//     });

//     res.json({
//       orders,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });

//   } catch (err) {
//     console.error('❌ Lỗi lấy orders cho chef:', err);
//     res.status(500).json({ 
//       error: 'Không thể lấy danh sách đơn hàng cho chef', 
//       details: err.message 
//     });
  
//     // Lấy tất cả order items cho các orders này
//     const orderIds = orders.map(order => order._id);
//     const orderItems = await OrderItem.find({ 
//       orderId: { $in: orderIds } 
//     })
//     .populate('menuItemId', 'name category cookingTime image')
//     .lean();

//     // Group items theo orderId
//     const itemMap = {};
//     orderItems.forEach(item => {
//       const key = item.orderId.toString();
//       if (!itemMap[key]) itemMap[key] = [];
//       itemMap[key].push(item);
//     });

//     // Combine orders với items và thêm thông tin thời gian
//     const ordersWithItems = orders.map(order => {
//       const items = itemMap[order._id.toString()] || [];
//       const waitingTime = Math.floor((new Date() - new Date(order.orderTime)) / (1000 * 60)); // phút
      
//       return {
//         ...order,
//         items,
//         waitingTime,
//         itemCount: items.length,
//         estimatedCookingTime: Math.max(...items.map(item => item.menuItemId?.cookingTime || 0))
//       };
//     });

//     // Đếm tổng số orders
//     const totalCount = await Order.countDocuments({ 
//       status: { $in: statusFilter }
//       // Bỏ điều kiện paymentStatus - Chef cần thấy tất cả đơn
//     });

//     res.json({
//       orders: ordersWithItems,
//       totalCount,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(totalCount / limit),
//       statusFilter
//     });

//   } catch (err) {
//     console.error(' Lỗi lấy danh sách đơn hàng cho Chef:', err);
//     res.status(500).json({ 
//       error: 'Không thể lấy danh sách đơn hàng', 
//       details: err.message 
//     });
  


// // Cập nhật trạng thái đơn hàng (Chef)
// exports.updateOrderStatusByChef = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, estimatedTime } = req.body;

//     // Validate status
//     const validStatuses = ['pending', 'preparing', 'served'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         error: 'Trạng thái không hợp lệ',
//         validStatuses 
//       });
//     }

//     const updateData = { status };
    
//     // Nếu chuyển sang preparing, cập nhật thời gian bắt đầu nấu
//     if (status === 'preparing') {
//       updateData.preparingStartTime = new Date();
//       if (estimatedTime) {
//         updateData.estimatedCompleteTime = new Date(Date.now() + estimatedTime * 60000);
//       }
//     }
    
//     // Nếu chuyển sang served, cập nhật thời gian hoàn thành
//     if (status === 'served') {
//       updateData.completedTime = new Date();
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       id, 
//       updateData, 
//       { new: true }
//     ).populate('sessionId', 'tableNumber customerName');

//     if (!updatedOrder) {
//       return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
//     }

//     // Cập nhật tất cả order items nếu đơn hàng served
//     if (status === 'served') {
//       await OrderItem.updateMany(
//         { orderId: id },
//         { status: 'done' }
//       );
//     }

//     res.json({ 
//       message: `Đã cập nhật trạng thái đơn hàng thành ${status}`,
//       order: updatedOrder 
//     });

//   } catch (err) {
//     console.error('❌ Lỗi cập nhật trạng thái đơn hàng:', err);
//     res.status(500).json({ 
//       error: 'Không thể cập nhật trạng thái đơn hàng', 
//       details: err.message 
//     });
//   }
// };

// // Cập nhật trạng thái từng món ăn
// exports.updateOrderItemStatusByChef = async (req, res) => {
//   try {
//     const { itemId } = req.params;
//     const { status } = req.body;

//     const validStatuses = ['ordered', 'preparing', 'done'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         error: 'Trạng thái món ăn không hợp lệ',
//         validStatuses 
//       });
//     }

//     const updatedItem = await OrderItem.findByIdAndUpdate(
//       itemId,
//       { status },
//       { new: true }
//     ).populate('menuItemId', 'name category');

//     if (!updatedItem) {
//       return res.status(404).json({ error: 'Không tìm thấy món ăn' });
//     }

//     // Kiểm tra xem tất cả items của order đã done chưa
//     const allItems = await OrderItem.find({ orderId: updatedItem.orderId });
//     const allDone = allItems.every(item => item.status === 'done');

//     // Nếu tất cả món đã xong, tự động cập nhật order status thành served
//     if (allDone) {
//       await Order.findByIdAndUpdate(updatedItem.orderId, { 
//         status: 'served',
//         completedTime: new Date()
//       });
//     }

//     res.json({ 
//       message: `Đã cập nhật trạng thái món ăn thành ${status}`,
//       item: updatedItem,
//       orderCompleted: allDone
//     });

//   } catch (err) {
//     console.error('❌ Lỗi cập nhật trạng thái món ăn:', err);
//     res.status(500).json({ 
//       error: 'Không thể cập nhật trạng thái món ăn', 
//       details: err.message 
//     });
//   }
// };

// // Lấy thống kê cho Chef dashboard
// exports.getChefDashboardStats = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const stats = await Promise.all([
//       // Đơn hàng chờ xử lý (tất cả đơn pending)
//       Order.countDocuments({ 
//         status: 'pending'
//       }),
      
//       // Đơn hàng đang nấu
//       Order.countDocuments({ 
//         status: 'preparing' 
//       }),
      
//       // Đơn hàng hoàn thành hôm nay
//       Order.countDocuments({ 
//         status: 'served',
//         completedTime: { $gte: today }
//       }),
      
//       // Tổng doanh thu hôm nay (chỉ tính đơn đã thanh toán)
//       Order.aggregate([
//         {
//           $match: {
//             status: 'served',
//             paymentStatus: 'paid',
//             completedTime: { $gte: today }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: '$totalAmount' }
//           }
//         }
//       ])
//     ]);

//     res.json({
//       pendingOrders: stats[0],
//       preparingOrders: stats[1],
//       completedToday: stats[2],
//       revenueToday: stats[3][0]?.total || 0,
//       timestamp: new Date()
//     });

//   } catch (err) {
//     console.error('❌ Lỗi lấy thống kê Chef:', err);
//     res.status(500).json({ 
//       error: 'Không thể lấy thống kê', 
//       details: err.message 
//     });
//   }
// };

const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

// Lấy danh sách đơn hàng cho Chef (chỉ pending và preparing)
// exports.getOrdersForChef = async (req, res) => {
//   try {
//     const { status, limit = 20, page = 1 } = req.query;
    
//     // Chef chỉ cần xem đơn hàng pending và preparing
//     const validStatuses = ['pending', 'preparing'];
//     let statusFilter = validStatuses;
    
//     if (status && validStatuses.includes(status)) {
//       statusFilter = [status];
//     }

//     const skip = (page - 1) * limit;
    
//     // Lấy orders với populate session info VÀ table info
//     const orders = await Order.find({ 
//       status: { $in: statusFilter }
//     })
//     .populate({
//       path: 'sessionId',
//       populate: {
//         path: 'table',
//         model: 'Table'
//       }
//     })
//     .sort({ orderTime: 1 }) // Chef thường xem đơn cũ trước
//     .limit(parseInt(limit))
//     .skip(skip)
//     .lean();

//     // Lấy tất cả order items cho các orders này
//     const orderIds = orders.map(order => order._id);
//     const orderItems = await OrderItem.find({ 
//       orderId: { $in: orderIds } 
//     })
//     // .populate('menuItemId', 'name category cookingTime image')
//     // .lean();
//     .populate({
//       path: 'menuItemId',
//       select: 'name category cookingTime image',
//       populate: {
//         path: 'category', // Populate category object
//         select: 'name'    // Chỉ lấy tên category
//       }
//     })
//     .lean();
//     // Group items theo orderId
//     const itemMap = {};
//     orderItems.forEach(item => {
//       const key = item.orderId.toString();
//       if (!itemMap[key]) itemMap[key] = [];
//       itemMap[key].push(item);
//     });

//     // Combine orders với items và thêm thông tin thời gian
//     const ordersWithItems = orders.map(order => {
//       const items = itemMap[order._id.toString()] || [];
//       const waitingTime = Math.floor((new Date() - new Date(order.orderTime)) / (1000 * 60)); // phút
      
//       return {
//         ...order,
//         items,
//         waitingTime,
//         itemCount: items.length,
//         estimatedCookingTime: Math.max(...items.map(item => item.menuItemId?.cookingTime || 0))
//       };
//     });

//     // Đếm tổng số orders
//     const totalCount = await Order.countDocuments({ 
//       status: { $in: statusFilter }
//     });

//     res.json({
//       orders: ordersWithItems,
//       totalCount,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(totalCount / limit),
//       statusFilter
//     });

//   } catch (err) {
//     console.error('❌ Lỗi lấy danh sách đơn hàng cho Chef:', err);
//     res.status(500).json({ 
//       error: 'Không thể lấy danh sách đơn hàng', 
//       details: err.message 
//     });
//   }
// };

exports.getOrdersForChef = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    // Chef chỉ cần xem đơn hàng pending và preparing
    const validStatuses = ['pending', 'preparing'];
    let statusFilter = validStatuses;
    
    if (status && validStatuses.includes(status)) {
      statusFilter = [status];
    }

    const skip = (page - 1) * limit;
    
    // Lấy orders với populate session info VÀ table info
    const orders = await Order.find({ 
      status: { $in: statusFilter }
    })
    .populate({
      path: 'sessionId',
      populate: {
        path: 'table',
        model: 'Table'
      }
    })
    .sort({ orderTime: 1 }) // Chef thường xem đơn cũ trước
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

    // Lấy tất cả order items cho các orders này
    const orderIds = orders.map(order => order._id);
    const orderItems = await OrderItem.find({ 
      orderId: { $in: orderIds } 
    })
    .populate({
      path: 'menuItemId',
      select: 'name category cookingTime image',
      populate: {
        path: 'category',
        select: 'name'
      }
    })
    .lean();

    // Group items theo orderId
    const itemMap = {};
    orderItems.forEach(item => {
      const key = item.orderId.toString();
      if (!itemMap[key]) itemMap[key] = [];
      itemMap[key].push(item);
    });

    // Combine orders với items và apply smart merge
    const ordersWithItems = orders.map(order => {
      const items = itemMap[order._id.toString()] || [];
      const mergedItems = smartMergeItems(items); // 🔥 THÊM SMART MERGE
      const waitingTime = Math.floor((new Date() - new Date(order.orderTime)) / (1000 * 60));
      
      return {
        ...order,
        items: mergedItems, // Sử dụng merged items
        originalItems: items, // Giữ original để debug nếu cần
        waitingTime,
        itemCount: mergedItems.length, // Count theo merged
        originalItemCount: items.length, // Count gốc
        estimatedCookingTime: Math.max(...items.map(item => item.menuItemId?.cookingTime || 0))
      };
    });

    // Đếm tổng số orders
    const totalCount = await Order.countDocuments({ 
      status: { $in: statusFilter }
    });

    res.json({
      orders: ordersWithItems,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      statusFilter
    });

  } catch (err) {
    console.error('❌ Lỗi lấy danh sách đơn hàng cho Chef:', err);
    res.status(500).json({ 
      error: 'Không thể lấy danh sách đơn hàng', 
      details: err.message 
    });
  }
};
// Cập nhật trạng thái đơn hàng (Chef)
exports.updateOrderStatusByChef = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedTime } = req.body;

    // Validate status
    const validStatuses = ['pending', 'preparing', 'served'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Trạng thái không hợp lệ',
        validStatuses 
      });
    }

    const updateData = { status };
    
    // Nếu chuyển sang preparing, cập nhật thời gian bắt đầu nấu
    if (status === 'preparing') {
      updateData.preparingStartTime = new Date();
      if (estimatedTime) {
        updateData.estimatedCompleteTime = new Date(Date.now() + estimatedTime * 60000);
      }
    }
    
    // Nếu chuyển sang served, cập nhật thời gian hoàn thành
    if (status === 'served') {
      updateData.completedTime = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate({
      path: 'sessionId',
      populate: {
        path: 'table',
        model: 'Table'
      }
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    // Cập nhật tất cả order items nếu đơn hàng served
    if (status === 'served') {
      await OrderItem.updateMany(
        { orderId: id },
        { status: 'done' }
      );
    }

    res.json({ 
      message: `Đã cập nhật trạng thái đơn hàng thành ${status}`,
      order: updatedOrder 
    });

  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái đơn hàng:', err);
    res.status(500).json({ 
      error: 'Không thể cập nhật trạng thái đơn hàng', 
      details: err.message 
    });
  }
};

// Cập nhật trạng thái từng món ăn
// exports.updateOrderItemStatusByChef = async (req, res) => {
//   try {
//     const { itemId } = req.params;
//     const { status } = req.body;

//     const validStatuses = ['ordered', 'preparing', 'done'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         error: 'Trạng thái món ăn không hợp lệ',
//         validStatuses 
//       });
//     }

//     const updatedItem = await OrderItem.findByIdAndUpdate(
//       itemId,
//       { status },
//       { new: true }
//     ).populate('menuItemId', 'name category');

//     if (!updatedItem) {
//       return res.status(404).json({ error: 'Không tìm thấy món ăn' });
//     }

//     // Kiểm tra xem tất cả items của order đã done chưa
//     const allItems = await OrderItem.find({ orderId: updatedItem.orderId });
//     const allDone = allItems.every(item => item.status === 'done');

//     // Nếu tất cả món đã xong, tự động cập nhật order status thành served
//     if (allDone) {
//       await Order.findByIdAndUpdate(updatedItem.orderId, { 
//         status: 'served',
//         completedTime: new Date()
//       });
//     }

//     res.json({ 
//       message: `Đã cập nhật trạng thái món ăn thành ${status}`,
//       item: updatedItem,
//       orderCompleted: allDone
//     });

//   } catch (err) {
//     console.error('❌ Lỗi cập nhật trạng thái món ăn:', err);
//     res.status(500).json({ 
//       error: 'Không thể cập nhật trạng thái món ăn', 
//       details: err.message 
//     });
//   }
// };

// Cập nhật trạng thái từng món ăn - FIXED VERSION
// exports.updateOrderItemStatusByChef = async (req, res) => {
//   try {
//     const { itemId } = req.params;
//     const { status } = req.body;

//     const validStatuses = ['ordered', 'preparing', 'done'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         error: 'Trạng thái món ăn không hợp lệ',
//         validStatuses 
//       });
//     }

//     const updatedItem = await OrderItem.findByIdAndUpdate(
//       itemId,
//       { status },
//       { new: true }
//     ).populate('menuItemId', 'name category');

//     if (!updatedItem) {
//       return res.status(404).json({ error: 'Không tìm thấy món ăn' });
//     }

//     // 🔥 FIXED: Kiểm tra và cập nhật trạng thái Order
//     const allItems = await OrderItem.find({ orderId: updatedItem.orderId });
    
//     // Kiểm tra trạng thái của tất cả items
//     const hasPreparingItems = allItems.some(item => item.status === 'preparing');
//     const allDone = allItems.every(item => item.status === 'done');
//     const allOrdered = allItems.every(item => item.status === 'ordered');

//     let newOrderStatus = null;
//     let updateOrderData = {};

//     if (allDone) {
//       // Tất cả món đã xong -> Order served
//       newOrderStatus = 'served';
//       updateOrderData = { 
//         status: 'served',
//         completedTime: new Date()
//       };
//     } else if (hasPreparingItems && !allOrdered) {
//       // Có ít nhất 1 món đang nấu -> Order preparing
//       newOrderStatus = 'preparing';
//       updateOrderData = { 
//         status: 'preparing',
//         preparingStartTime: new Date()
//       };
//     } else if (allOrdered) {
//       // Tất cả món vẫn chưa bắt đầu -> Order pending
//       newOrderStatus = 'pending';
//       updateOrderData = { status: 'pending' };
//     }

//     // Cập nhật trạng thái Order nếu cần
//     if (newOrderStatus) {
//       await Order.findByIdAndUpdate(updatedItem.orderId, updateOrderData);
//     }

//     res.json({ 
//       message: `Đã cập nhật trạng thái món ăn thành ${status}`,
//       item: updatedItem,
//       orderStatus: newOrderStatus,
//       orderCompleted: allDone
//     });

//   } catch (err) {
//     console.error('❌ Lỗi cập nhật trạng thái món ăn:', err);
//     res.status(500).json({ 
//       error: 'Không thể cập nhật trạng thái món ăn', 
//       details: err.message 
//     });
//   }
// };

exports.updateOrderItemStatusByChef = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status, itemIds } = req.body; // Thêm itemIds cho merged items

    const validStatuses = ['ordered', 'preparing', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Trạng thái món ăn không hợp lệ',
        validStatuses 
      });
    }

    // Nếu có itemIds (merged items), update multiple
    const idsToUpdate = itemIds && itemIds.length > 0 ? itemIds : [itemId];
    
    // Update tất cả items
    const updatePromises = idsToUpdate.map(id => 
      OrderItem.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('menuItemId', 'name category')
    );

    const updatedItems = await Promise.all(updatePromises);
    
    if (updatedItems.some(item => !item)) {
      return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    }

    // Lấy orderId từ item đầu tiên
    const orderId = updatedItems[0].orderId;

    // Kiểm tra xem tất cả items của order đã done chưa
    const allItems = await OrderItem.find({ orderId });
    const allDone = allItems.every(item => item.status === 'done');
    const hasPreparingItems = allItems.some(item => item.status === 'preparing');
    const allOrdered = allItems.every(item => item.status === 'ordered');

    let newOrderStatus = null;
    let updateOrderData = {};

    if (allDone) {
      newOrderStatus = 'served';
      updateOrderData = { 
        status: 'served',
        completedTime: new Date()
      };
    } else if (hasPreparingItems && !allOrdered) {
      newOrderStatus = 'preparing';
      updateOrderData = { 
        status: 'preparing',
        preparingStartTime: new Date()
      };
    } else if (allOrdered) {
      newOrderStatus = 'pending';
      updateOrderData = { status: 'pending' };
    }

    // Cập nhật trạng thái Order nếu cần
    if (newOrderStatus) {
      await Order.findByIdAndUpdate(orderId, updateOrderData);
    }

    res.json({ 
      message: `Đã cập nhật ${idsToUpdate.length} món ăn thành ${status}`,
      items: updatedItems,
      orderStatus: newOrderStatus,
      orderCompleted: allDone
    });

  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái món ăn:', err);
    res.status(500).json({ 
      error: 'Không thể cập nhật trạng thái món ăn', 
      details: err.message 
    });
  }
};
// Bắt đầu nấu tất cả món trong đơn hàng - 
exports.startCookingOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { estimatedTime } = req.body;

    // Lấy tất cả items của order
    const orderItems = await OrderItem.find({ orderId: id });
    const itemsToStart = orderItems.filter(item => item.status === 'ordered');
    
    if (itemsToStart.length === 0) {
      return res.status(400).json({ 
        error: 'Không có món nào cần bắt đầu nấu' 
      });
    }

    // Cập nhật tất cả items thành preparing
    await OrderItem.updateMany(
      { orderId: id, status: 'ordered' },
      { status: 'preparing' }
    );

    // Cập nhật trạng thái order
    const updateData = { 
      status: 'preparing',
      preparingStartTime: new Date()
    };
    
    if (estimatedTime) {
      updateData.estimatedCompleteTime = new Date(Date.now() + estimatedTime * 60000);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate({
      path: 'sessionId',
      populate: {
        path: 'table',
        model: 'Table'
      }
    });

    res.json({ 
      message: `Đã bắt đầu nấu ${itemsToStart.length} món`,
      order: updatedOrder,
      itemsStarted: itemsToStart.length
    });

  } catch (err) {
    console.error('❌ Lỗi bắt đầu nấu đơn hàng:', err);
    res.status(500).json({ 
      error: 'Không thể bắt đầu nấu đơn hàng', 
      details: err.message 
    });
  }
};

// Lấy thống kê cho Chef dashboard
exports.getChefDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Promise.all([
      
      Order.countDocuments({ 
        status: 'pending'
      }),
      
      
      Order.countDocuments({ 
        status: 'preparing' 
      }),
      
      // Đơn hàng hoàn thành hôm nay
      Order.countDocuments({ 
        status: 'served',
        completedTime: { $gte: today }
      }),
      
      // Tổng doanh thu hôm nay 
      Order.aggregate([
        {
          $match: {
            status: 'served',
            paymentStatus: 'paid',
            completedTime: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ])
    ]);

    res.json({
      pendingOrders: stats[0],
      preparingOrders: stats[1],
      completedToday: stats[2],
      revenueToday: stats[3][0]?.total || 0,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('❌ Lỗi lấy thống kê Chef:', err);
    res.status(500).json({ 
      error: 'Không thể lấy thống kê', 
      details: err.message 
    });
  }
};


const smartMergeItems = (items) => {
  const grouped = {};
  
  items.forEach(item => {
    // Key = menuItemId + notes (normalize notes)
    const normalizedNotes = (item.notes || '').trim().toLowerCase();
    const key = `${item.menuItemId._id}__${normalizedNotes}`;
    
    if (grouped[key]) {
      // Merge cùng món + cùng notes
      grouped[key].quantity += item.quantity;
      grouped[key].totalPrice += item.price;
      grouped[key].itemIds.push(item._id);
      
      // Ưu tiên status cao nhất: done > preparing > ordered
      const statusPriority = { 'ordered': 1, 'preparing': 2, 'done': 3 };
      if (statusPriority[item.status] > statusPriority[grouped[key].status]) {
        grouped[key].status = item.status;
      }
    } else {
      // Tạo group mới
      grouped[key] = {
        ...item,
        quantity: item.quantity,
        totalPrice: item.price,
        itemIds: [item._id],
        displayKey: key
      };
    }
  });
  
  return Object.values(grouped);
};