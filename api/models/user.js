const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const userSchema = new Schema({

  username: { type: String, required: [true, "Name is required"], unique: true },
  email: { type: String, required: [true, "Email is required"], unique: true },
  password: { type: String },
  vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }],
  points: { type: Number, default: 0, min: 0 },
  role: {
    type: String,
    enum: ['admin', 'user', 'manager', 'chef', 'cashier', 'staff'],
    default: 'user'
  },
  
},{
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
