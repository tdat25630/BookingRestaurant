const express = require('express');
const router = express.Router();
const Table = require('../models/table');

// Tạo mới bàn
router.post('/', async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const table = new Table({ tableNumber, capacity });
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// (Tùy chọn) Lấy danh sách bàn
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
