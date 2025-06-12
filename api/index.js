const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());

// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000', // địa chỉ frontend của bạn
  credentials: true
}));


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
app.use('/api/invoices', require('./routes/invoice'));
app.use('/api/reservation', require('./routes/reservation.route'));

// app.use('/api/admin', require('./routes/AdminRoute'));

// middlewares
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on port ${PORT}`);
});
