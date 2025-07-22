const MenuItem = require('../models/MenuItem');
const OrderItem = require('../models/orderItem');
const createError = require('../util/errorHandle');

exports.createOrderItem = async (req, res) => {
  try {
    const item = new OrderItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getItemsByOrder = async (req, res) => {
  try {
    const items = await OrderItem.find({ order: req.params.orderId }).populate('menuItem');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderItemStatus = async (req, res) => {
  try {
    const updated = await OrderItem.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getBestSellerItems = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topItems = await OrderItem.aggregate([
      {
        $group: {
          _id: '$menuItemId',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit }
    ]);

    const enrichedItems = await Promise.all(
      topItems.map(async (item) => {
        try {
          const menuItem = await MenuItem.findById(item._id).lean(); // dùng lean() để trả về plain JS object

          return {
            id: item._id,
            name: menuItem?.name || 'Unknown Item',
            image: menuItem?.image || '',
            price: menuItem?.price || 0,
            description: menuItem?.description || '',
            category: menuItem?.category || 'Uncategorized',
            totalQuantity: item.totalQuantity,
            totalRevenue: item.totalRevenue
          };
        } catch (error) {
          console.error(`❌ Error retrieving menu item ${item._id}:`, error);
          return {
            id: item._id,
            name: 'Error retrieving item',
            totalQuantity: item.totalQuantity,
            totalRevenue: item.totalRevenue
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      count: enrichedItems.length,
      data: enrichedItems
    });
  } catch (err) {
    console.error('🔥 Lỗi lấy danh sách món ăn bán chạy:', err);
    return next(createError(500, 'Không thể lấy danh sách món ăn bán chạy', { cause: err }));
  }
};
