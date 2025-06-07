const express = require('express');
const { getUsers } = require('../controller/user');
const { verifyAdmin } = require('../util/verifyToken');

const router = express.Router();

router.get('/',verifyAdmin, getUsers);

module.exports = router;