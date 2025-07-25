const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorMiddleware = require('./middlewares/errorMiddleware');

const menuCategoryRoutes = require('./routes/menuCategoryRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');

const diningSessionRoutes = require('./routes/diningSessionRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const chefRoutes = require('./routes/chefRoutes');
const promotionRoutes = require('./routes/promotionRoute');
const staffRoutes = require('./routes/staffRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const http = require('http');
const { setupWebSocket } = require('./websocket');

require('dotenv').config();
require('./cron-job/expireReservationsJob');

const app = express();
const server = http.createServer(app);

// === WebSocket Setup ===
setupWebSocket(server);

// === Middleware ===
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// === MongoDB Connection ===
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// === Routes ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/reservation', require('./routes/reservation.route'));
app.use('/api/zalopay', require('./routes/zaloPayRoutes'));

app.use('/api/menu-categories', menuCategoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/dining-sessions', diningSessionRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/chef', chefRoutes);
app.use('/api/staff', staffRoutes);

app.use(errorMiddleware);

// === Start Server ===
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  connectDb();
  console.log(`🚀 Express & WebSocket server running on port ${PORT}`);
});
