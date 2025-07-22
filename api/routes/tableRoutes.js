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
    const DiningSession = require('../models/diningSession');

    const tables = await Table.find();

    // Populate active sessions for each table
    const tablesWithSessions = await Promise.all(
      tables.map(async (table) => {
        const activeSession = await DiningSession.findOne({
          table: table._id,
          status: 'active'
        }).populate('table');

        return {
          ...table.toObject(),
          activeSession: activeSession
        };
      })
    );

    res.json(tablesWithSessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
