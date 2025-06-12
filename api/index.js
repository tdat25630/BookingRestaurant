const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorMiddleware = require('./middlewares/errorMiddleware');


const menuCategoryRoutes = require('./routes/menuCategoryRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const diningSessionRoutes = require('./routes/diningSessionRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');



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

app.use('/api/reservation', require('./routes/reservation.route'));


// app.use('/api/admin', require('./routes/AdminRoute'));
app.use('/api/menu-categories', menuCategoryRoutes);
app.use('/api/menu-items', menuItemRoutes);

app.use('/api/dining-sessions', diningSessionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);


// middlewares
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on port ${PORT}`);
});
