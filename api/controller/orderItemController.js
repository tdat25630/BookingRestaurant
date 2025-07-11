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

    
    const basicPipeline = [
      {
        $group: {
          _id: '$menuItemId', // Hoặc menuItem tùy theo schema của bạn
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit }
    ];

    const topItems = await OrderItem.aggregate(basicPipeline);

    
    const enrichedItems = await Promise.all(topItems.map(async (item) => {
      try {
        // Tìm thông tin món ăn từ menu item collection
        const menuItem = await MenuItem.findById(item._id);
        console.log(menuItem)

        return {
          id: item._id,
          name: menuItem?.name || 'Unknown Item',
          image: menuItem?.image || '',
          price: menuItem?.price || 0,
          description: menuItem?.description || '',
          category: 'Uncategorized', // Bạn có thể thêm lookup category riêng nếu cần
          totalQuantity: item.totalQuantity,
          totalRevenue: item.totalRevenue
        };
      } catch (err) {
        console.error(`Error enriching menu item ${item._id}:`, err);
        return {
          id: item._id,
          name: 'Error retrieving item',
          totalQuantity: item.totalQuantity,
          totalRevenue: item.totalRevenue
        };
      }
    }));

    return res.status(200).json({
      success: true,
      count: enrichedItems.length,
      data: enrichedItems
    });
  } catch (err) {
    next(createError(500, 'Không thể lấy danh sách món ăn bán chạy', { cause: err }));
    console.error(' Lỗi lấy danh sách món ăn bán chạy:', err);
  }
};

