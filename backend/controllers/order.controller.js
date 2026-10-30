const crypto = require('crypto');
const db = require('../config/db');
const { calculateCartSummary } = require('./cart.controller');
const emailService = require('../services/email.service');

async function createOrder(req, res, next) {
  const connection = await db.getConnection();

  try {
    const {
      items,
      coupon_code,
      shipping_address,
      billing_address,
      shipping_method,
      payment_method = 'UPI',
      payment_details,
      customer_email,
      customer_name,
      customer_phone,
      notes
    } = req.body;

    if (!items || items.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    if (!shipping_address || !customer_email || !customer_name) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Shipping address, customer name, and customer email are required.'
      });
    }

    // 1. Calculate pricing server-side to prevent client-side tampering
    const cartSummary = await calculateCartSummary(items, coupon_code);

    if (cartSummary.items.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'None of the items in your cart are currently available.' });
    }

    // 2. Begin Transaction
    await connection.beginTransaction();

    // 3. Atomically check and reserve inventory for all items
    for (const item of cartSummary.items) {
      const [updateRes] = await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
        [item.quantity, item.product_id, item.quantity]
      );

      // In MySQL, affectedRows tells us if stock was sufficient; fallback store also sets affectedRows
      if (updateRes && updateRes.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${item.name}". Another shopper may have just reserved the remaining units.`
        });
      }
    }

    const orderNumber = 'NN-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
    const userId = req.user ? req.user.id : null;

    // Generate unguessable access token for guest orders to protect order privacy
    const guestAccessToken = !userId ? crypto.randomBytes(32).toString('hex') : null;

    // Determine truthful payment status
    const isCOD = payment_method.toUpperCase() === 'COD';
    const isProduction = process.env.NODE_ENV === 'production';
    const paymentMode = process.env.PAYMENT_MODE || 'mock';

    let orderPaymentStatus = 'paid';
    let paymentRecordStatus = 'succeeded';

    if (isCOD) {
      orderPaymentStatus = 'unpaid';
      paymentRecordStatus = 'pending';
    } else if (paymentMode === 'mock') {
      if (isProduction) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Production payment gateway is currently offline. Mock payments are strictly disabled in production.'
        });
      }
      orderPaymentStatus = 'paid';
      paymentRecordStatus = 'succeeded';
    }

    // 4. Insert Order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number, user_id, subtotal_amount, discount_amount, shipping_fee, tax_amount, total_amount,
        status, payment_status, shipping_address, billing_address, shipping_method, customer_email,
        customer_name, customer_phone, notes, guest_access_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        cartSummary.subtotal,
        cartSummary.discount,
        cartSummary.shipping_fee,
        cartSummary.tax,
        cartSummary.total,
        'processing',
        orderPaymentStatus,
        JSON.stringify(shipping_address),
        billing_address ? JSON.stringify(billing_address) : null,
        shipping_method || 'White-Glove Express Delivery',
        customer_email.trim(),
        customer_name.trim(),
        customer_phone || shipping_address.phone || null,
        notes || null,
        guestAccessToken
      ]
    );

    const orderId = orderResult.insertId;

    // 5. Insert Order Items (Price snapshotting)
    for (const item of cartSummary.items) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, quantity, subtotal_price, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.variant_id,
          item.name,
          item.variant_name,
          item.sku,
          item.price,
          item.quantity,
          item.line_total,
          item.image_url
        ]
      );
    }

    // 6. Record Payment with consistent INR Currency
    const txnId = 'TXN-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    await connection.query(
      `INSERT INTO payments (
        order_id, payment_method, transaction_id, amount, currency, status, payment_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        payment_method,
        txnId,
        cartSummary.total,
        'INR',
        paymentRecordStatus,
        JSON.stringify({
          mode: isProduction ? 'live_gateway' : 'development_mock',
          currency: 'INR',
          method: payment_method,
          timestamp: new Date().toISOString()
        })
      ]
    );

    // 7. If coupon was used, increment usage count inside transaction
    if (cartSummary.applied_coupon) {
      await connection.query(
        'UPDATE coupons SET times_used = times_used + 1 WHERE code = ?',
        [cartSummary.applied_coupon.code]
      );
    }

    // 8. Commit Transaction
    await connection.commit();
    connection.release();

    // 9. Send Order Confirmation Email asynchronously
    const fullOrder = {
      order_number: orderNumber,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim(),
      subtotal_amount: cartSummary.subtotal,
      discount_amount: cartSummary.discount,
      shipping_fee: cartSummary.shipping_fee,
      tax_amount: cartSummary.tax,
      total_amount: cartSummary.total
    };
    emailService.sendOrderConfirmation(fullOrder, cartSummary.items);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: cartSummary.total,
        status: 'processing',
        payment_status: orderPaymentStatus,
        transaction_id: txnId,
        guest_access_token: guestAccessToken
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const [orders] = await db.query(
      'SELECT id, order_number, subtotal_amount, discount_amount, shipping_fee, tax_amount, total_amount, status, payment_status, shipping_method, tracking_number, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Fetch items for each order
    const enrichedOrders = [];
    for (const o of orders || []) {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      enrichedOrders.push({
        ...o,
        items: items || []
      });
    }

    return res.json({
      success: true,
      data: enrichedOrders
    });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const tokenHeader = req.headers['x-order-token'] || req.query.token;

    let querySql = 'SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1';
    const [rows] = await db.query(querySql, [id, id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = rows[0];

    // Privacy & Authorization Enforcement:
    // 1. Admin can view any order
    const isAdmin = req.user && req.user.role === 'admin';
    // 2. Registered owner can view their own order
    const isOwner = req.user && order.user_id && req.user.id === order.user_id;
    // 3. Guest order can be viewed ONLY with matching cryptographic token
    const isAuthorizedGuest = !order.user_id && order.guest_access_token && tokenHeader && order.guest_access_token === tokenHeader;

    if (!isAdmin && !isOwner && !isAuthorizedGuest) {
      if (order.user_id && !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Please log in to your account to view this order.'
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.'
      });
    }

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const [payments] = await db.query('SELECT payment_method, transaction_id, amount, currency, status, created_at FROM payments WHERE order_id = ?', [order.id]);

    // Don't expose internal guest access token in response body
    const { guest_access_token, ...safeOrder } = order;

    return res.json({
      success: true,
      data: {
        ...safeOrder,
        shipping_address: typeof safeOrder.shipping_address === 'string' ? JSON.parse(safeOrder.shipping_address) : safeOrder.shipping_address,
        items: items || [],
        payment: payments && payments[0] ? payments[0] : null
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById
};
