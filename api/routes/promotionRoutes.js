const express = require('express');
const router = express.Router();
const promotionController = require('../controller/promotionController');


router.get('/active', promotionController.getActivePromotions);

module.exports = router;
