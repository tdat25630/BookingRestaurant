const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true, unique: true }, // Ví dụ: A1, B2
  capacity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available'
  }
});

module.exports = mongoose.model('Table', TableSchema);
