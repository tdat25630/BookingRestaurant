const MenuItem = require('../models/MenuItem');

// GET: Lấy tất cả menu item
// exports.getAllMenuItems = async (req, res) => {
//   try {
//     const items = await MenuItem.find().populate('category');
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
exports.getAllMenuItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const items = await MenuItem.find(filter).populate('category');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Lấy menu item theo ID
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST: Tạo menu item mới
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, image, price, isAvailable, category } = req.body;
    const newItem = new MenuItem({ name, description, image, price, isAvailable, category });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT: Cập nhật menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE: Xoá menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
