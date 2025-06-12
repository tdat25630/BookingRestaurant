const mongoose = require('mongoose');

const DiningSessionSchema = new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, nếu không đăng nhập
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
});

module.exports = mongoose.model('DiningSession', DiningSessionSchema);
