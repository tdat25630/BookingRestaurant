const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');
// GET /api/menu → lấy toàn bộ menu, bao gồm tên danh mục
router.get('/', async (req, res) => {
  try {
    const menu = await MenuItem.find().populate('category'); // JOIN dữ liệu danh mục
    res.status(200).json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
