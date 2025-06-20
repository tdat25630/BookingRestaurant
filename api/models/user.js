const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const userSchema = new Schema({

  username: { type: String, required: [true, "Name is required"],unique : true },
  email: { type: String, required: [true, "Email is required"],unique : true },
  password: { type: String },
  
  role: { 
    type: String, 
    enum: ['admin', 'user','manager','chef'],
    default: 'user' },

}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
