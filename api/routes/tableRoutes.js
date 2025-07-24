const express = require('express');
const router = express.Router();
const Table = require('../models/table');
const diningSession = require('../models/diningSession');

// Tạo mới bàn
const isValidTableNumber = (value) => /^[A-Za-z]*\d+$/.test(value);

router.post('/', async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (!isValidTableNumber(tableNumber)) {
      return res.status(400).json({ message: 'Bàn phải có định dạng: "1", "A2", hoặc "VIP99"' });
    }

    const exists = await Table.findOne({ tableNumber });
    if (exists) {
      return res.status(400).json({ message: 'Số bàn đã tồn tại!' });
    }

    const newTable = new Table({ tableNumber, capacity });
    await newTable.save();
    res.status(201).json(newTable);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
});

// (Tùy chọn) Lấy danh sách bàn

router.get('/', async (req, res) => {
  try {
    const tables = await Table.find();

    tables.sort((a, b) => {
      const parse = (val) => {
        const match = val.tableNumber.match(/^([a-zA-Z]*)(\d+)$/);
        if (match) {
          const [, prefix = '', number] = match;
          return { prefix, number: parseInt(number, 10) };
        }
        return { prefix: '', number: isNaN(val.tableNumber) ? 0 : parseInt(val.tableNumber, 10) };
      };

      const aParsed = parse(a);
      const bParsed = parse(b);

      if (aParsed.prefix === bParsed.prefix) {
        return aParsed.number - bParsed.number;
      }

      return aParsed.prefix.localeCompare(bParsed.prefix);
    });

    const tablesWithSessions = await Promise.all(
      tables.map(async (table) => {
        const activeSession = await diningSession.findOne({
          table: table._id,
          status: 'active'
        }).populate('table'); // Optional

        return {
          ...table.toObject(),
          activeSession
        };
      })
    );

    res.json(tablesWithSessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there is an active session with this table
    const checkTable = await diningSession.findOne({ table: id, status: { $ne: 'completed' } });
    if (checkTable) {
      return res.status(400).json({ message: "Bàn đang được sử dụng và không thể xóa." });
    }

    const response = await Table.findByIdAndDelete(id);

    if (!response) {
      return res.status(404).json({ message: "Không tìm thấy bàn." });
    }

    return res.json({ message: "Bàn đã được xóa.", table: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server khi xóa bàn." });
  }
});

module.exports = router;
