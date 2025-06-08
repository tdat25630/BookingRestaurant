const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());

app.use(cors());

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {

    console.error("MongoDB connection failed: ", error);
    process.exit(1);
  }
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/menu', require('./routes/menu'));

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack
  })
})

app.listen(8080, () => {
  connectDb();
  console.log("Server is running on port 8080");
})
