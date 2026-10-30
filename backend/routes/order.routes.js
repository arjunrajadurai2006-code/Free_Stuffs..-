const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateUser, optionalAuth } = require('../middleware/auth.middleware');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/', authenticateUser, orderController.getUserOrders);
router.get('/:id', optionalAuth, orderController.getOrderById);

module.exports = router;
