const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItems', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, 
    notes: String,
    status: { type: String, enum: ['waiting', 'cooking', 'ready', 'served'], default: 'waiting' },
    made_by: { type: Schema.Types.ObjectId, ref: 'Staff' }
});
const OrderItem = mongoose.model("OrderItem", orderItemSchema);

module.exports = OrderItem;