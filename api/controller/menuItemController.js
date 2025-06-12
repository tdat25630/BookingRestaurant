const MenuItem = require('../models/MenuItem');

// [POST] /api/admin/menu
const createMenuItem = async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Create menu item failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/admin/menu
const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().populate('category');
    res.json(items);
  } catch (error) {
    console.error("Fetch menu items failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/admin/menu/:id
const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category');
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (error) {
    console.error("Get item by ID failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/admin/menu/:id
const updateMenuItem = async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Menu item not found' });
    res.json(updated);
  } catch (error) {
    console.error("Update menu item failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// [DELETE] /api/admin/menu/:id
const deleteMenuItem = async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error("Delete menu item failed:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
};
