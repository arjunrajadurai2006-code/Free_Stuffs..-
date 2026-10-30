const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth.middleware');
const { upload, verifyImageSignature } = require('../middleware/upload.middleware');

// Protect all admin routes with requireAdmin middleware
router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);

// Product Management
router.get('/products', adminController.getAdminProducts);
router.post('/products', upload.single('image'), verifyImageSignature, adminController.createProduct);
router.patch('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Order Management
router.get('/orders', adminController.getAdminOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Customer Management
router.get('/customers', adminController.getAdminCustomers);

module.exports = router;
