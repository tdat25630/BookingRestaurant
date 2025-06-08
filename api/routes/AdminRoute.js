// // src/routes/AdminRoutes.js (ví dụ)
// import React from 'react';

const express = require('express');
const router = express.Router();


const menuItemController = require('../controller/menuItemController');
console.log('menuItemController:', menuItemController);

const menuCategoryController = require('../controller/menuCategoryController');
const userController = require('../controller/userController');

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Bảo vệ route: phải login + phải là admin mới được truy cập
router.use(authMiddleware);
router.use(adminMiddleware);

// --- Menu Item Routes ---
router.get('/menu', menuItemController.getMenuItems);
router.post('/menu', menuItemController.createMenuItem);
router.put('/menu/:id', menuItemController.updateMenuItem);
router.delete('/menu/:id', menuItemController.deleteMenuItem);

// --- Menu Category Routes ---
router.post('/categories', menuCategoryController.createCategory);
router.get('/categories', menuCategoryController.getCategories);
router.put('/categories/:id', menuCategoryController.updateCategory);
router.delete('/categories/:id', menuCategoryController.deleteCategory);

// --- User Routes ---
router.get('/users', userController.getUsers);
router.put('/users/:id', userController.updateUserRole);
router.delete('/users/:id', userController.deleteUser);


module.exports = router;
