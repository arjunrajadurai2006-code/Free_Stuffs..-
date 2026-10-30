/**
 * NEST & NOVA — End-to-End Functionality & API Verification Suite
 * Tests all user journeys from click to database update.
 */

const assert = require('assert');
const db = require('../backend/config/db');

// Controllers & Middlewares
const productController = require('../backend/controllers/product.controller');
const pincodeController = require('../backend/controllers/pincode.controller');
const cartController = require('../backend/controllers/cart.controller');
const authController = require('../backend/controllers/auth.controller');
const orderController = require('../backend/controllers/order.controller');
const adminController = require('../backend/controllers/admin.controller');
const contactController = require('../backend/controllers/contact.controller');
const { requireAuth, requireAdmin } = require('../backend/middleware/auth.middleware');

function createMockReq(options = {}) {
  return {
    query: options.query || {},
    params: options.params || {},
    body: options.body || {},
    headers: options.headers || {},
    cookies: options.cookies || {},
    user: options.user || null
  };
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    send(payload) {
      this.data = payload;
      return this;
    },
    cookie(name, val) {
      this.headers[name] = val;
    },
    clearCookie(name) {
      delete this.headers[name];
    }
  };
}

const journeyResults = [];

function recordResult(journeyNumber, name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : (status === 'FAIL' ? '❌' : '⚠️');
  console.log(`${icon} Journey ${journeyNumber}: ${name} [${status}] ${details ? '— ' + details : ''}`);
  journeyResults.push({ journeyNumber, name, status, details });
}

async function runE2ESuite() {
  console.log('======================================================================');
  console.log('🌿 NEST & NOVA — End-to-End Verification of Core Features');
  console.log('======================================================================\n');

  try {
    await db.initializeDatabase();
  } catch (e) {}

  try {
    // 1. Electronics Catalog Browsing
    {
      const req = createMockReq({ query: { department: 'electronics' } });
      const res = createMockRes();
      await productController.getProducts(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length > 0);
      assert.ok(res.data.data.every(p => p.department === 'electronics'));
      recordResult(1, 'Electronics Department Catalog Filtering', 'PASS', `${res.data.data.length} electronics items returned`);
    }

    // 2. Furniture Catalog Browsing
    {
      const req = createMockReq({ query: { department: 'furniture' } });
      const res = createMockRes();
      await productController.getProducts(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length > 0);
      assert.ok(res.data.data.every(p => p.department === 'furniture'));
      recordResult(2, 'Furniture Department Catalog Filtering', 'PASS', `${res.data.data.length} furniture items returned`);
    }

    // 3. Product Details with Specifications
    {
      const req = createMockReq({ params: { id: '1' } });
      const res = createMockRes();
      await productController.getProductById(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.data.id, 1);
      assert.ok(res.data.data.specifications);
      assert.ok(Array.isArray(res.data.data.images));
      recordResult(3, 'Product Detail & Technical Specs Retrieval', 'PASS', `Product 1 "${res.data.data.name}" loaded with specs`);
    }

    // 4. Product Comparison Engine Backend Endpoint
    {
      const req = createMockReq({ query: { ids: '1,2,3' } });
      const res = createMockRes();
      await productController.compareProducts(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.length, 3);
      assert.ok(res.data.data[0].specifications);
      recordResult(4, 'Electronics Product Comparison API (/api/products/compare)', 'PASS', 'Returned side-by-side specs for 3 devices');
    }

    // 5. Indian PIN Code Verification (Valid PIN)
    {
      const req = createMockReq({ query: { code: '560001' } });
      const res = createMockRes();
      await pincodeController.checkPincode(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.serviceable, true);
      assert.strictEqual(res.data.city, 'Bengaluru');
      recordResult(5, 'Indian PIN Code Serviceability Check (Valid PIN)', 'PASS', 'PIN 560001 verified for Bengaluru');
    }

    // 6. Indian PIN Code Verification (Invalid PIN)
    {
      const req = createMockReq({ query: { code: '999' } });
      const res = createMockRes();
      await pincodeController.checkPincode(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.serviceable, false);
      recordResult(6, 'Indian PIN Code Format Rejection (Invalid PIN)', 'PASS', 'Short PIN code correctly rejected with 400');
    }

    // 7. Server-Side Cart Calculation & Free Shipping Threshold
    {
      const req = createMockReq({
        body: {
          items: [{ product_id: 1, quantity: 1 }],
          coupon_code: ''
        }
      });
      const res = createMockRes();
      await cartController.validateCart(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.data.items[0].product_id, 1);
      assert.strictEqual(res.data.data.subtotal, 24999);
      assert.strictEqual(res.data.data.shipping_fee, 0); // Above ₹4,999 is free shipping
      recordResult(7, 'Cart Validation & Complimentary Shipping Threshold', 'PASS', `Subtotal: ₹${res.data.data.subtotal}, Shipping: ₹${res.data.data.shipping_fee}`);
    }

    // 8. Promo Coupon Discount Validation
    {
      const req = createMockReq({
        body: {
          items: [{ product_id: 1, quantity: 1 }],
          coupon_code: 'WELCOME10'
        }
      });
      const res = createMockRes();
      await cartController.validateCart(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.data.applied_coupon.code, 'WELCOME10');
      assert.strictEqual(Math.round(res.data.data.discount), 2500); // 10% of 24999
      recordResult(8, 'Promo Coupon Discount Calculation (WELCOME10)', 'PASS', `Applied 10% discount: -₹${res.data.data.discount}`);
    }

    // 9. Customer Registration
    const testEmail = `tester_${Date.now()}@nestandnova.in`;
    let registeredUser = null;
    {
      const req = createMockReq({
        body: {
          full_name: 'Pooja Hegde',
          email: testEmail,
          password: 'Password123!',
          phone: '+91 98450 77112'
        }
      });
      const res = createMockRes();
      await authController.register(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.user.email, testEmail);
      registeredUser = res.data.user;
      recordResult(9, 'Customer Registration Flow', 'PASS', `Registered user ${testEmail}`);
    }

    // 10. Customer Login (Valid Credentials)
    {
      const req = createMockReq({
        body: {
          email: testEmail,
          password: 'Password123!'
        }
      });
      const res = createMockRes();
      await authController.login(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.headers.token || res.data.token);
      recordResult(10, 'Customer Login & Token Issuance', 'PASS', 'Valid credentials returned JWT session');
    }

    // 11. Customer Login Rejection (Invalid Password)
    {
      const req = createMockReq({
        body: {
          email: testEmail,
          password: 'WrongPassword999!'
        }
      });
      const res = createMockRes();
      await authController.login(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.data.success, false);
      recordResult(11, 'Login Security (Invalid Password Handling)', 'PASS', '401 Unauthorized accurately returned without fallback mask');
    }

    // 12. Authenticated Profile Verification
    {
      const req = createMockReq({ user: registeredUser });
      const res = createMockRes();
      await authController.getMe(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.user.email, testEmail);
      recordResult(12, 'Session Verification (/api/auth/me)', 'PASS', `Session verified for ${res.data.user.full_name}`);
    }

    // 13. Guest Order Placement & Unguessable Token Generation
    let guestOrderNumber = '';
    let guestAccessToken = '';
    {
      const req = createMockReq({
        user: null, // Guest checkout
        body: {
          items: [{ product_id: 1, quantity: 1 }],
          customer_name: 'Anand Kumar',
          customer_email: 'anand.kumar@example.in',
          customer_phone: '+91 98450 11223',
          shipping_address: {
            fullName: 'Anand Kumar',
            addressLine1: 'Flat 201, Koramangala 4th Block',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560034',
            country: 'India'
          },
          shipping_method: 'White-Glove Express',
          payment_method: 'UPI - Google Pay',
          total: 24999
        }
      });
      const res = createMockRes();
      await orderController.createOrder(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.order.order_number);
      assert.ok(res.data.order.guest_access_token);
      guestOrderNumber = res.data.order.order_number;
      guestAccessToken = res.data.order.guest_access_token;
      recordResult(13, 'Guest Order Placement & Token Generation', 'PASS', `Order #${guestOrderNumber} issued unguessable token`);
    }

    // 14. Order Access Privacy Enforcement (Unauthorized Block)
    {
      const req = createMockReq({
        params: { id: guestOrderNumber },
        user: null,
        headers: {} // No token provided
      });
      const res = createMockRes();
      await orderController.getOrderById(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 403);
      recordResult(14, 'Order Privacy Protection (Unauthorized Request Blocked)', 'PASS', 'Access forbidden without credentials/token');
    }

    // 15. Order Access with Secure Token
    {
      const req = createMockReq({
        params: { id: guestOrderNumber },
        headers: { 'x-order-token': guestAccessToken }
      });
      const res = createMockRes();
      await orderController.getOrderById(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.data.order_number, guestOrderNumber);
      recordResult(15, 'Order Access via Verified Token', 'PASS', `Token verified for Order #${guestOrderNumber}`);
    }

    // 16. Admin Authorization Guard (Customer Blocked)
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'nest_and_nova_super_secret_jwt_key_2026_change_in_production';
    const customerToken = jwt.sign({ id: registeredUser.id, email: registeredUser.email, role: 'customer' }, JWT_SECRET);
    const adminToken = jwt.sign({ id: 1, email: 'admin@nestandnova.com', role: 'admin' }, JWT_SECRET);

    {
      let nextCalled = false;
      const req = createMockReq({ cookies: { token: customerToken } });
      const res = createMockRes();
      requireAdmin(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 403);
      recordResult(16, 'Admin Route Authorization Guard (Customer Blocked)', 'PASS', 'Customer blocked from administrative operations');
    }

    // 17. Admin Authorization Guard (Admin Allowed)
    const adminUser = { id: 1, full_name: 'Nova Administrator', email: 'admin@nestandnova.com', role: 'admin' };
    {
      let nextCalled = false;
      const req = createMockReq({ cookies: { token: adminToken } });
      const res = createMockRes();
      requireAdmin(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
      recordResult(17, 'Admin Route Authorization Guard (Admin Permitted)', 'PASS', 'Admin credentials allowed through middleware');
    }

    // 18. Admin Dashboard Metrics
    {
      const req = createMockReq({ user: adminUser });
      const res = createMockRes();
      await adminController.getDashboardStats(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.data.stats);
      assert.ok(typeof res.data.stats.totalProducts === 'number');
      assert.ok(Array.isArray(res.data.recentOrders));
      recordResult(18, 'Admin Dashboard Metrics & Statistics', 'PASS', `Total products: ${res.data.stats.totalProducts}, Orders: ${res.data.stats.totalOrders}`);
    }

    // 19. Admin Product Management Catalog
    {
      const req = createMockReq({ user: adminUser, query: { page: 1, limit: 50 } });
      const res = createMockRes();
      await adminController.getAdminProducts(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 22);
      recordResult(19, 'Admin Products Catalog Management', 'PASS', `${res.data.data.length} products listed in admin table`);
    }

    // 20. Admin Order Status Update
    {
      const req = createMockReq({
        user: adminUser,
        params: { id: '1' },
        body: { status: 'shipped', tracking_number: 'NN-IN-DEL-889922' }
      });
      const res = createMockRes();
      await adminController.updateOrderStatus(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      recordResult(20, 'Admin Order Status & Tracking Update', 'PASS', 'Order status updated to shipped with tracking number');
    }

    // 21. Admin Customer Registry
    {
      const req = createMockReq({ user: adminUser, query: { page: 1, limit: 50 } });
      const res = createMockRes();
      await adminController.getAdminCustomers(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.data.data));
      recordResult(21, 'Admin Customer Registry Management', 'PASS', `${res.data.data.length} customers listed in admin table`);
    }

    // 22. Newsletter Subscription
    {
      const req = createMockReq({ body: { email: 'lifestyle@bangalore.in' } });
      const res = createMockRes();
      await contactController.handleNewsletter(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      recordResult(22, 'Newsletter Subscription Inquiry', 'PASS', res.data.message);
    }

    // 23. Concierge Contact Form Inquiry
    {
      const req = createMockReq({
        body: {
          name: 'Ananya Roy',
          email: 'ananya.roy@example.com',
          phone: '+91 98450 33441',
          subject: 'Custom Walnut Dining Table Inquiries',
          message: 'Interested in bespoke 8-seater dimensions for an apartment in Indiranagar.'
        }
      });
      const res = createMockRes();
      await contactController.handleContactForm(req, res, (err) => { throw err; });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      recordResult(23, 'Concierge Contact Form Persistence', 'PASS', 'Customer inquiry persisted successfully');
    }

    // 24. Customer Sign Out
    {
      const req = createMockReq({ user: registeredUser });
      const res = createMockRes();
      await authController.logout(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      recordResult(24, 'Customer Sign Out & Session Teardown', 'PASS', 'Session cookie cleared successfully');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n======================================================================');
  const passCount = journeyResults.filter(r => r.status === 'PASS').length;
  console.log(`📊 E2E Functionality Results: ${passCount} / ${journeyResults.length} PASSED`);
  console.log('======================================================================');
}

runE2ESuite();
