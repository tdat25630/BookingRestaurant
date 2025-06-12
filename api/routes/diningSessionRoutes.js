const express = require('express');
const router = express.Router();
const diningSessionController = require('../controller/diningSessionController');

// Tạo mới session khi khách đến (bằng QR)
router.post('/', diningSessionController.createDiningSession);

// Lấy session theo bàn
router.get('/table/:tableId', diningSessionController.getActiveSessionByTable);

// Kết thúc session
router.put('/end/:id', diningSessionController.endDiningSession);

module.exports = router;
