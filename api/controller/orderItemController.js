const OrderItem = require('../models/orderItem');

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
