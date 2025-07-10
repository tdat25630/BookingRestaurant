const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;

const ReservationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  reservationDate: {
    type: Date,
    required: true
  },
  reservationTime: {
    type: String, // Format: 'HH:mm' (e.g., '18:30')
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // 24-hour format
      },
      message: props => `${props.value} is not a valid time format (HH:mm)`
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  specialRequest: {
    type: String,
    default: ''
  },
  guestCount: {
    type: Number,
    required: true
  },
  preOrders: {
    type: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
    required: false,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', ReservationSchema);
