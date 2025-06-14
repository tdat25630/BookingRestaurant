const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Lưu giá tại thời điểm gọi
  notes: { type: String },
  status: {
    type: String,
    enum: ['ordered', 'preparing', 'done'],
    default: 'ordered'
  }
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);

