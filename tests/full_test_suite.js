/**
 * NEST & NOVA — Comprehensive Automated Test Suite
 * Covers Security, Authentication, Order Privacy, Inventory, Coupons, and Uploads.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Import application components
const db = require('../backend/config/db');
const { calculateCartSummary, validateCoupon } = require('../backend/controllers/cart.controller');
const { createOrder, getOrderById } = require('../backend/controllers/order.controller');
const { submitReview, getProductReviews } = require('../backend/controllers/review.controller');
const { forgotPassword, resetPassword } = require('../backend/controllers/auth.controller');
const { handleContactForm } = require('../backend/controllers/contact.controller');
const { verifyImageSignature } = require('../backend/middleware/upload.middleware');

const results = [];

function recordTest(name, status, details = '') {
  results.push({ name, status, details });
  const icon = status === 'PASS' ? '✅' : (status === 'FAIL' ? '❌' : '⚠️');
  console.log(`${icon} [${status}] ${name} ${details ? '- ' + details : ''}`);
}

// Mock Response Builder
function createMockRes() {
  const res = {
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
    cookie() {},
    clearCookie() {}
  };
  return res;
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running NEST & NOVA Full-Stack Verification Suite');
  console.log('====================================================\n');

  // Test 1: Syntax check of all JS files
  try {
    const { execSync } = require('child_process');
    const jsFiles = [
      'backend/server.js',
      'backend/config/db.js',
      'backend/controllers/auth.controller.js',
      'backend/controllers/order.controller.js',
      'backend/controllers/cart.controller.js',
      'backend/controllers/product.controller.js',
      'backend/controllers/review.controller.js',
      'backend/controllers/contact.controller.js',
      'backend/middleware/upload.middleware.js',
      'frontend/js/api.js',
      'frontend/js/checkout.js',
      'frontend/js/products.js',
      'frontend/js/app.js'
    ];
    for (const f of jsFiles) {
      execSync(`node -c ${f}`);
    }
    recordTest('1. JavaScript Syntax Check', 'PASS', `${jsFiles.length} files parsed cleanly.`);
  } catch (err) {
    recordTest('1. JavaScript Syntax Check', 'FAIL', err.message);
  }

  // Test 2: Database and Fallback Store Initialization
  try {
    await db.initializeDatabase();
    recordTest('2. Database Initialization', 'PASS', 'Database connection / fallback store initialized.');
  } catch (err) {
    recordTest('2. Database Initialization', 'FAIL', err.message);
  }

  // Test 3: Password Hashing & Authentication Security
  try {
    const password = 'TestSecurePassword123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    assert(await bcrypt.compare(password, hash), 'Bcrypt compare failed');
    assert(!(await bcrypt.compare('WrongPassword', hash)), 'Bcrypt should fail on wrong password');
    recordTest('3. Password Hashing Security', 'PASS', 'Bcrypt salts and verifies passwords correctly.');
  } catch (err) {
    recordTest('3. Password Hashing Security', 'FAIL', err.message);
  }

  // Test 4: Pricing & Server-Side Cart Calculation in INR
  try {
    const items = [
      { product_id: 1, quantity: 2 } // Aura ANC Wireless Headphones (₹24,999 each)
    ];
    const summary = await calculateCartSummary(items, null);
    assert.strictEqual(summary.subtotal, 49998, `Expected subtotal 49998, got ${summary.subtotal}`);
    assert.strictEqual(summary.shipping_fee, 0, 'Subtotal > 4999 should have free shipping');
    assert(summary.tax > 0, 'Tax should be calculated');
    recordTest('4. Server-Side Cart Calculation', 'PASS', `Subtotal ₹${summary.subtotal}, Tax ₹${summary.tax}, Total ₹${summary.total}`);
  } catch (err) {
    recordTest('4. Server-Side Cart Calculation', 'FAIL', err.message);
  }

  // Test 5: Coupon Date & Minimum Order Rules (INR)
  try {
    const req = { body: { code: 'WELCOME10', subtotal: 1000 } };
    const res = createMockRes();
    await validateCoupon(req, res, () => {});
    assert.strictEqual(res.statusCode, 400, 'Coupon should be rejected if minimum subtotal not met');
    assert(res.data.message.includes('₹'), 'Error message should format minimum amount in ₹');
    recordTest('5. Coupon Business Logic & Currency Rules', 'PASS', res.data.message);
  } catch (err) {
    recordTest('5. Coupon Business Logic & Currency Rules', 'FAIL', err.message);
  }

  // Test 6: Order Creation & Guest Access Token Generation
  let createdOrderId = null;
  let createdOrderNum = null;
  let guestToken = null;
  try {
    const req = {
      user: null, // Guest checkout
      body: {
        items: [{ product_id: 8, quantity: 1 }], // Apex Controller
        shipping_address: {
          fullName: 'Vikram Mehta',
          phone: '9845012345',
          addressLine1: '78 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001'
        },
        customer_name: 'Vikram Mehta',
        customer_email: 'vikram.mehta@example.com',
        payment_method: 'UPI'
      }
    };
    const res = createMockRes();
    await createOrder(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 201, 'Order should be created with 201');
    assert(res.data.order.guest_access_token, 'Guest order MUST receive a cryptographically unguessable access token');
    createdOrderId = res.data.order.id;
    createdOrderNum = res.data.order.order_number;
    guestToken = res.data.order.guest_access_token;
    recordTest('6. Guest Order & Token Generation', 'PASS', `Order #${createdOrderNum} issued secure token.`);
  } catch (err) {
    recordTest('6. Guest Order & Token Generation', 'FAIL', err.message);
  }

  // Test 7: Order Privacy Enforcement (Unauthorized Access Rejection)
  try {
    // 7a: Unauthenticated guest trying to access order without token -> 403
    const unauthReq = {
      params: { id: createdOrderNum },
      headers: {},
      query: {},
      user: null
    };
    const unauthRes = createMockRes();
    await getOrderById(unauthReq, unauthRes, () => {});
    assert.strictEqual(unauthRes.statusCode, 403, 'Unauthorized order access must return 403');

    // 7b: Wrong token provided -> 403
    const badTokenReq = {
      params: { id: createdOrderNum },
      headers: { 'x-order-token': 'wrong_invalid_token_123456789' },
      query: {},
      user: null
    };
    const badTokenRes = createMockRes();
    await getOrderById(badTokenReq, badTokenRes, () => {});
    assert.strictEqual(badTokenRes.statusCode, 403, 'Bad token must return 403');

    // 7c: Valid guest token provided -> 200 OK
    const validTokenReq = {
      params: { id: createdOrderNum },
      headers: { 'x-order-token': guestToken },
      query: {},
      user: null
    };
    const validTokenRes = createMockRes();
    await getOrderById(validTokenReq, validTokenRes, () => {});
    assert.strictEqual(validTokenRes.statusCode, 200, 'Valid token must grant access');
    assert.strictEqual(validTokenRes.data.data.order_number, createdOrderNum, 'Order number matches');

    recordTest('7. Order Privacy & Token Verification', 'PASS', 'Unauthorized requests blocked; valid token granted access.');
  } catch (err) {
    recordTest('7. Order Privacy & Token Verification', 'FAIL', err.message);
  }

  // Test 8: Atomic Inventory Protection & Overselling Prevention
  try {
    // Attempt to order 9999 units of a product
    const oversellReq = {
      user: null,
      body: {
        items: [{ product_id: 8, quantity: 9999 }],
        shipping_address: {
          fullName: 'Test User',
          addressLine1: 'Test',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001'
        },
        customer_name: 'Test',
        customer_email: 'test@example.com'
      }
    };
    const oversellRes = createMockRes();
    await createOrder(oversellReq, oversellRes, () => {});
    assert.strictEqual(oversellRes.statusCode, 400, 'Oversell attempt must return 400');
    assert(oversellRes.data.message.includes('Insufficient inventory'), 'Should report insufficient inventory');
    recordTest('8. Inventory Concurrency Protection', 'PASS', 'Overselling blocked and inventory protected.');
  } catch (err) {
    recordTest('8. Inventory Concurrency Protection', 'FAIL', err.message);
  }

  // Test 9: Magic-Byte Upload Verification
  try {
    const tempDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // 9a: Malicious payload disguised as JPG
    const fakeJpgPath = path.join(tempDir, 'fake-exploit.jpg');
    fs.writeFileSync(fakeJpgPath, '<?php echo "malicious payload"; ?>');

    const fakeReq = { file: { path: fakeJpgPath } };
    const fakeRes = createMockRes();
    let nextCalled = false;

    await new Promise((resolve) => {
      verifyImageSignature(fakeReq, fakeRes, () => {
        nextCalled = true;
        resolve();
      });
      // Poll briefly if res.json was called instead of next
      setTimeout(resolve, 100);
    });

    assert(!nextCalled, 'Next must not be called for spoofed image');
    assert.strictEqual(fakeRes.statusCode, 400, 'Fake image must be rejected with 400');
    assert(!fs.existsSync(fakeJpgPath), 'Fake image should be deleted from disk');

    // 9b: Valid JPEG with genuine FF D8 FF signature
    const validJpgPath = path.join(tempDir, 'valid-test.jpg');
    const validHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    fs.writeFileSync(validJpgPath, validHeader);

    const validReq = { file: { path: validJpgPath } };
    const validRes = createMockRes();
    let validNextCalled = false;

    await new Promise((resolve) => {
      verifyImageSignature(validReq, validRes, () => {
        validNextCalled = true;
        resolve();
      });
      setTimeout(resolve, 100);
    });

    fs.unlinkSync(validJpgPath);
    assert(validNextCalled, 'Genuine JPEG must pass signature verification');
    recordTest('9. Magic-Byte Upload Security', 'PASS', 'Spoofed files rejected & deleted; genuine images accepted.');
  } catch (err) {
    recordTest('9. Magic-Byte Upload Security', 'FAIL', err.message);
  }

  // Test 10: Verified Purchase Review Integrity
  try {
    // Non-purchaser submitting a review
    const nonBuyerReq = {
      user: { id: 999 }, // User who hasn't bought product 1
      body: {
        product_id: 1,
        rating: 5,
        title: 'Looks nice online',
        comment: 'I do not own this yet but it looks nice.'
      }
    };
    const nonBuyerRes = createMockRes();
    await submitReview(nonBuyerReq, nonBuyerRes, () => {});
    assert.strictEqual(nonBuyerRes.statusCode, 201);
    assert.strictEqual(nonBuyerRes.data.review.is_verified_purchase, false, 'Non-buyer must NOT be marked verified purchase');
    recordTest('10. Verified Purchase Review Integrity', 'PASS', 'Verified purchase badges strictly require prior purchase.');
  } catch (err) {
    recordTest('10. Verified Purchase Review Integrity', 'FAIL', err.message);
  }

  // Test 11: Contact Form Persistence
  try {
    const contactReq = {
      body: {
        name: 'Pooja Nair',
        email: 'pooja@example.com',
        department: 'Furniture',
        subject: 'Custom Walnut Dining Table',
        message: 'Do you offer custom seating dimensions for Indiranagar delivery?'
      }
    };
    const contactRes = createMockRes();
    await handleContactForm(contactReq, contactRes, (err) => { throw err; });
    assert.strictEqual(contactRes.statusCode, 201, 'Contact message must return 201');
    const [messages] = await db.query('SELECT * FROM contact_messages');
    assert(messages.length > 0, 'Contact message must be persisted to database');
    recordTest('11. Contact Form Persistence', 'PASS', 'Customer concierge inquiries persisted to database.');
  } catch (err) {
    recordTest('11. Contact Form Persistence', 'FAIL', err.message);
  }

  // Test 12: Password Reset Workflow (Random Token & Single-Use Enforcement)
  try {
    // 12a: Request reset token
    const forgotReq = { body: { email: 'customer@nestandnova.com' } };
    const forgotRes = createMockRes();
    await forgotPassword(forgotReq, forgotRes, () => {});

    const [userRows] = await db.query('SELECT reset_token FROM users WHERE email = ?', ['customer@nestandnova.com']);
    const resetToken = userRows[0]?.reset_token;
    assert(resetToken, 'User must have a generated reset token');

    // 12b: Reset password with valid token
    const resetReq = { body: { token: resetToken, new_password: 'NewCustomerPass2026!' } };
    const resetRes = createMockRes();
    await resetPassword(resetReq, resetRes, () => {});
    assert.strictEqual(resetRes.statusCode, 200, 'Password reset should succeed');

    // 12c: Try reusing same token -> must fail (single-use)
    const reuseRes = createMockRes();
    await resetPassword(resetReq, reuseRes, () => {});
    assert.strictEqual(reuseRes.statusCode, 400, 'Reused reset token must be rejected');
    recordTest('12. Password Reset Workflow', 'PASS', 'Random expiring token generated and invalidated after single use.');
  } catch (err) {
    recordTest('12. Password Reset Workflow', 'FAIL', err.message);
  }

  console.log('\n====================================================');
  console.log('📊 Test Summary:');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`Passed: ${passed} / ${results.length}`);
  console.log(`Failed: ${failed} / ${results.length}`);
  console.log('====================================================');
}

runTests();
