const express = require('express');
const { getUsers, getUserById } = require('../controller/user');
const { verifyAdmin, verifyUser } = require('../util/verifyToken');

const router = express.Router();

router.get('/', verifyAdmin, getUsers);
router.get('/:id', verifyUser, getUserById);
router.put('/:id', verifyUser, getUserById);

module.exports = router;