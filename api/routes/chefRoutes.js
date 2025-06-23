// const express = require('express');
// const router = express.Router();
// const chefOrderController = require('../controller/chefOrderController');

// const checkChefRole = (req, res, next) => {
//   const user = req.user;
//   if (!user || user.role !== 'chef') {
//     return res.status(403).json({ error: 'Chỉ Chef mới có quyền truy cập' });
//   }
//   next();
// };


// // Routes cho Chef
// router.get('/orders', checkChefRole, chefOrderController.getOrdersForChef);
// router.put('/orders/:id/status', checkChefRole, chefOrderController.updateOrderStatusByChef);
// router.put('/order-items/:itemId/status', checkChefRole, chefOrderController.updateOrderItemStatusByChef);
// router.get('/dashboard/stats', checkChefRole, chefOrderController.getChefDashboardStats);

// module.exports = router;


const express = require('express');
const router = express.Router();
const chefOrderController = require('../controller/chefOrderController');

// Routes cho Chef
router.get('/orders', chefOrderController.getOrdersForChef);
router.put('/orders/:id/status', chefOrderController.updateOrderStatusByChef);
router.put('/order-items/:itemId/status', chefOrderController.updateOrderItemStatusByChef);
router.get('/dashboard/stats', chefOrderController.getChefDashboardStats);

module.exports = router;