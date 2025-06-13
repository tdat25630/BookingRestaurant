// const mongoose = require('mongoose');

// const DiningSessionSchema = new mongoose.Schema({
//   table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, nếu không đăng nhập
//   startTime: { type: Date, default: Date.now },
//   endTime: { type: Date },
//   status: {
//     type: String,
//     enum: ['active', 'completed'],
//     default: 'active'
//   }
// });

// module.exports = mongoose.model('DiningSession', DiningSessionSchema);
// models/diningSession.js
const mongoose = require('mongoose');

const DiningSessionSchema = new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // sửa lại từ userId → user
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
});

module.exports = mongoose.model('DiningSession', DiningSessionSchema);
