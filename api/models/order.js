const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiningSession', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // optional
  orderTime: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'served', 'cancelled'],
    default: 'pending'
  },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  }
});

module.exports = mongoose.model('Order', OrderSchema);
