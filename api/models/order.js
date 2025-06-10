const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    promotion_id: { type: Schema.Types.ObjectId, ref: 'Promotion' },
    total_amount: { type: Number, default: 0 }, 
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'completed', 'cancelled'], 
        default: 'pending' 
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;