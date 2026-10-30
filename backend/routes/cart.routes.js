const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

router.post('/validate', cartController.validateCart);
router.post('/apply-coupon', cartController.validateCoupon);

module.exports = router;
