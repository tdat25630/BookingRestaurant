const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');
router.get('/', async (req, res) => {
  try {
    const menu = await MenuItem.find().populate('category'); 
    res.status(200).json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
