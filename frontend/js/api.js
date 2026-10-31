/**
 * NEST & NOVA 2.0 — Universal API Client & Resilient Client-Side Demo Engine
 * Supports: Vercel Static Deployment, Localhost, Zero-Cloud Demo Mode
 * Features: LocalStorage Auth, Cart & Wishlist, Orders, Admin Panel, Indian INR Math
 */

function getAssetPath(relativePath) {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
    return relativePath;
  }
  const clean = relativePath.replace(/^\/+/, '');
  const inAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('\\admin');
  return inAdmin ? `../${clean}` : clean;
}

window.getAssetPath = getAssetPath;

function demoError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  err.isDemoError = true;
  return err;
}

// ==============================================================================
// Client-Side Demo Persistence Store (localStorage)
// ==============================================================================
const DemoStore = {
  USERS_KEY: 'nn_demo_users',
  SESSION_KEY: 'nn_demo_user',
  ORDERS_KEY: 'nn_demo_orders',
  PRODUCTS_KEY: 'nn_demo_products',

  getUsers() {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Default pre-seeded users matching seed data
    const initialUsers = [
      {
        id: 1,
        full_name: 'Nova Administrator',
        email: 'admin@nestandnova.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91 98450 01928',
        created_at: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        full_name: 'Sarah Jenkins',
        email: 'customer@nestandnova.com',
        password: 'customer123',
        role: 'customer',
        phone: '+91 98450 12345',
        created_at: '2026-01-15T00:00:00.000Z'
      }
    ];
    this.saveUsers(initialUsers);
    return initialUsers;
  },

  saveUsers(users) {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (e) {}
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.SESSION_KEY);
      }
    } catch (e) {}
  },

  getOrders() {
    try {
      const stored = localStorage.getItem(this.ORDERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Realistic pre-seeded demo orders
    const initialOrders = [
      {
        id: 101,
        order_number: 'NN-2026-89412',
        user_id: 2,
        customer_name: 'Sarah Jenkins',
        email: 'customer@nestandnova.com',
        phone: '+91 98450 12345',
        total_amount: 24999,
        status: 'delivered',
        payment_status: 'paid',
        payment_method: 'UPI / Google Pay',
        shipping_method: 'White-Glove Express Courier',
        shipping_address: {
          fullName: 'Sarah Jenkins',
          phone: '+91 98450 12345',
          addressLine1: '42, 100 Feet Road, Indiranagar',
          addressLine2: 'Suite 4B',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          addressType: 'Home'
        },
        tracking_number: 'BLR-EXP-992184',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        items: [
          {
            product_id: 1,
            product_name: 'Aura ANC Wireless Studio Headphones',
            quantity: 1,
            unit_price: 24999,
            subtotal_price: 24999,
            image_url: 'assets/images/headphone.jpg'
          }
        ]
      },
      {
        id: 102,
        order_number: 'NN-2026-91340',
        user_id: 2,
        customer_name: 'Sarah Jenkins',
        email: 'customer@nestandnova.com',
        phone: '+91 98450 12345',
        total_amount: 48999,
        status: 'processing',
        payment_status: 'paid',
        payment_method: 'Credit Card (Visa)',
        shipping_method: 'White-Glove Express Courier',
        shipping_address: {
          fullName: 'Sarah Jenkins',
          phone: '+91 98450 12345',
          addressLine1: '42, 100 Feet Road, Indiranagar',
          addressLine2: 'Suite 4B',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          addressType: 'Home'
        },
        tracking_number: 'DEL-EXP-440192',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        items: [
          {
            product_id: 10,
            product_name: 'Koto 3-Piece Modular Bouclé Chaise Sofa',
            quantity: 1,
            unit_price: 48999,
            subtotal_price: 48999,
            image_url: 'assets/images/sofa.jpg'
          }
        ]
      }
    ];
    this.saveOrders(initialOrders);
    return initialOrders;
  },

  saveOrders(orders) {
    try {
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {}
  },

  getProducts() {
    try {
      const stored = localStorage.getItem(this.PRODUCTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    const baseProducts = (window.NEST_NOVA_DATA && window.NEST_NOVA_DATA.products) || [];
    return [...baseProducts];
  },

  saveProducts(products) {
    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {}
  }
};

window.DemoStore = DemoStore;

const API_BASE = (window.location.protocol === 'file:')
  ? 'http://localhost:5000/api'
  : '/api';

const api = {
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const defaultHeaders = {
      'Accept': 'application/json'
    };

    const activeOrderToken = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('nn_order_token') : null;
    if (activeOrderToken) {
      defaultHeaders['x-order-token'] = activeOrderToken;
    }

    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      // If backend exists and responded with success
      if (response.ok) {
        return data;
      }

      // If server returned 404/500/502/503 (e.g. Vercel static host without backend), attempt demo fallback
      if (response.status === 404 || response.status >= 500) {
        const fallback = this.offlineFallback(endpoint, options);
        if (fallback !== null) {
          return fallback;
        }
      }

      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    } catch (err) {
      // If error was thrown intentionally from offlineFallback (e.g., validation/auth error)
      if (err.isDemoError) {
        throw err;
      }

      // If server responded with a real HTTP error from backend (like 401 or 400 from live server), throw directly
      if (err.status && err.status !== 404 && err.status < 500) {
        throw err;
      }

      // Network failures (e.g. TypeError: Failed to fetch) or static host fallback
      const fallbackResult = this.offlineFallback(endpoint, options);
      if (fallbackResult !== null) {
        return fallbackResult;
      }

      console.warn(`[API Network Notice] ${options.method || 'GET'} ${url} unreachable.`, err.message);
      throw err;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // ==============================================================================
  // Comprehensive Demo Mode & Offline Fallback Engine
  // ==============================================================================
  offlineFallback(endpoint, options = {}) {
    const data = window.NEST_NOVA_DATA;
    if (!data) return null;

    const [cleanPath, queryString] = endpoint.split('?');
    const params = new URLSearchParams(queryString || '');
    const method = (options.method || 'GET').toUpperCase();

    // Parse incoming request body
    let body = {};
    if (options.body instanceof FormData) {
      for (const [key, val] of options.body.entries()) {
        body[key] = val;
      }
    } else if (typeof options.body === 'string') {
      try { body = JSON.parse(options.body); } catch(e) {}
    } else if (options.body && typeof options.body === 'object') {
      body = options.body;
    }

    // ----------------------------------------------------------------------------
    // 1. PIN Code Checker: GET /pincode/check
    // ----------------------------------------------------------------------------
    if (cleanPath === '/pincode/check') {
      const code = params.get('code') || params.get('pincode') || '';
      const directory = data.pincodes || {};
      if (directory[code]) {
        const p = directory[code];
        return {
          success: true,
          serviceable: true,
          city: p.city,
          state: p.state,
          delivery_days: p.days,
          cod_available: p.cod,
          message: `Delivery in ${p.days} days to ${p.city}, ${p.state}`
        };
      } else if (code.length === 6 && /^\d+$/.test(code)) {
        return {
          success: true,
          serviceable: true,
          city: "India",
          state: "Standard Region",
          delivery_days: 4,
          cod_available: true,
          message: `Standard Express Delivery in 3-5 business days to ${code}`
        };
      } else {
        return {
          success: false,
          serviceable: false,
          message: 'Please enter a valid 6-digit Indian PIN code.'
        };
      }
    }

    // ----------------------------------------------------------------------------
    // 2. Authentication: POST /auth/login
    // ----------------------------------------------------------------------------
    if (cleanPath === '/auth/login' && method === 'POST') {
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';

      if (!email || !password) {
        throw demoError('Please enter both email and password.', 400);
      }

      // Admin Login Check
      if (email === 'admin@nestandnova.com') {
        if (password === 'admin123') {
          const adminUser = {
            id: 1,
            full_name: 'Nova Administrator',
            email: 'admin@nestandnova.com',
            role: 'admin',
            phone: '+91 98450 01928'
          };
          DemoStore.setCurrentUser(adminUser);
          return {
            success: true,
            message: 'Welcome back, Administrator!',
            user: adminUser
          };
        } else {
          throw demoError('Invalid administrator credentials. Demo password is: admin123', 401);
        }
      }

      // Customer Accounts Check
      const users = DemoStore.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email);

      if (!user) {
        throw demoError('Account not found. Please register to create a customer account.', 404);
      }

      // Do not allow arbitrary credentials to log in as administrator
      if (user.role === 'admin' && password !== 'admin123') {
        throw demoError('Unauthorized admin access.', 403);
      }

      if (user.password !== password) {
        throw demoError('Incorrect password. For demo customer, use: customer123', 401);
      }

      const sessionUser = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role || 'customer',
        phone: user.phone || ''
      };
      DemoStore.setCurrentUser(sessionUser);
      return {
        success: true,
        message: `Welcome back, ${sessionUser.full_name}!`,
        user: sessionUser
      };
    }

    // ----------------------------------------------------------------------------
    // 3. Authentication: POST /auth/register
    // ----------------------------------------------------------------------------
    if (cleanPath === '/auth/register' && method === 'POST') {
      const fullName = (body.full_name || body.name || '').trim();
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';
      const phone = (body.phone || '').trim();

      if (!fullName || !email || !password) {
        throw demoError('Full name, email, and password are required.', 400);
      }

      if (email === 'admin@nestandnova.com') {
        throw demoError('The administrator email address cannot be re-registered.', 400);
      }

      const users = DemoStore.getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        throw demoError('An account with this email address already exists. Please sign in.', 409);
      }

      const newUser = {
        id: Date.now(),
        full_name: fullName,
        email: email,
        password: password,
        role: 'customer',
        phone: phone || '+91 98450 00000',
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      DemoStore.saveUsers(users);

      const sessionUser = {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: 'customer',
        phone: newUser.phone
      };
      DemoStore.setCurrentUser(sessionUser);

      return {
        success: true,
        message: 'Account created successfully! Welcome to NEST & NOVA.',
        user: sessionUser
      };
    }

    // ----------------------------------------------------------------------------
    // 4. Authentication: GET /auth/me
    // ----------------------------------------------------------------------------
    if (cleanPath === '/auth/me') {
      const user = DemoStore.getCurrentUser();
      if (user) {
        return {
          success: true,
          user: user
        };
      }
      return {
        success: false,
        message: 'Not authenticated'
      };
    }

    // ----------------------------------------------------------------------------
    // 5. Authentication: POST /auth/logout
    // ----------------------------------------------------------------------------
    if (cleanPath === '/auth/logout') {
      DemoStore.setCurrentUser(null);
      try {
        sessionStorage.removeItem('nn_order_token');
      } catch (e) {}
      return {
        success: true,
        message: 'Logged out successfully.'
      };
    }

    // ----------------------------------------------------------------------------
    // 6. User Profile Updates: PUT /auth/profile & /auth/change-password
    // ----------------------------------------------------------------------------
    if (cleanPath === '/auth/profile' && method === 'PUT') {
      const user = DemoStore.getCurrentUser();
      if (!user) throw demoError('Authentication required.', 401);

      const fullName = (body.full_name || '').trim();
      const phone = (body.phone || '').trim();

      if (fullName) user.full_name = fullName;
      if (phone) user.phone = phone;

      DemoStore.setCurrentUser(user);

      const users = DemoStore.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        if (fullName) users[idx].full_name = fullName;
        if (phone) users[idx].phone = phone;
        DemoStore.saveUsers(users);
      }

      return {
        success: true,
        message: 'Profile information updated successfully!',
        user: user
      };
    }

    if (cleanPath === '/auth/change-password' && method === 'PUT') {
      const user = DemoStore.getCurrentUser();
      if (!user) throw demoError('Authentication required.', 401);

      const currentPassword = body.current_password || '';
      const newPassword = body.new_password || '';

      if (!newPassword || newPassword.length < 6) {
        throw demoError('New password must be at least 6 characters.', 400);
      }

      const users = DemoStore.getUsers();
      const found = users.find(u => u.id === user.id);
      if (found && found.password && found.password !== currentPassword) {
        throw demoError('Current password does not match.', 400);
      }

      if (found) {
        found.password = newPassword;
        DemoStore.saveUsers(users);
      }

      return {
        success: true,
        message: 'Password updated successfully!'
      };
    }

    // ----------------------------------------------------------------------------
    // 7. Product Catalog: GET /products or /products/search
    // ----------------------------------------------------------------------------
    if (cleanPath === '/products' || cleanPath.startsWith('/products/search')) {
      let results = [...DemoStore.getProducts()];
      const dept = params.get('department');
      const cat = params.get('category');
      const search = params.get('q') || params.get('search');
      const trending = params.get('trending');
      const featured = params.get('featured');
      const minPrice = parseFloat(params.get('min_price')) || 0;
      const maxPrice = parseFloat(params.get('max_price')) || Infinity;
      const brand = params.get('brand');
      const sort = params.get('sort');
      const limit = parseInt(params.get('limit')) || 100;

      if (dept) {
        results = results.filter(p => (p.department || '').toLowerCase() === dept.toLowerCase());
      }
      if (cat) {
        const catClean = cat.toLowerCase().replace(/[^a-z0-9]/g, '');
        results = results.filter(p => {
          const pCatName = (p.category_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const pSlug = (p.slug || '').toLowerCase();
          return pCatName.includes(catClean) || (p.category_id == cat) || pSlug.includes(catClean);
        });
      }
      if (brand) {
        results = results.filter(p => p.brand_name && p.brand_name.toLowerCase() === brand.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(p => 
          (p.name || '').toLowerCase().includes(q) ||
          (p.short_description || '').toLowerCase().includes(q) ||
          (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
          (p.category_name && p.category_name.toLowerCase().includes(q))
        );
      }
      if (trending === 'true' || trending === '1') {
        results = results.filter(p => p.is_trending);
      }
      if (featured === 'true' || featured === '1') {
        results = results.filter(p => p.is_featured);
      }
      if (minPrice > 0) {
        results = results.filter(p => p.price >= minPrice);
      }
      if (maxPrice < Infinity) {
        results = results.filter(p => p.price <= maxPrice);
      }

      if (sort === 'price-low') {
        results.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        results.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'discount') {
        results.sort((a, b) => b.discount_percent - a.discount_percent);
      }

      return {
        success: true,
        data: results.slice(0, limit),
        total: results.length
      };
    }

    // ----------------------------------------------------------------------------
    // 8. Product Comparison: GET /products/compare
    // ----------------------------------------------------------------------------
    if (cleanPath === '/products/compare') {
      const ids = (params.get('ids') || '').split(',').map(Number);
      const allProducts = DemoStore.getProducts();
      const items = allProducts.filter(p => ids.includes(p.id));
      return {
        success: true,
        data: items
      };
    }

    // ----------------------------------------------------------------------------
    // 9. Single Product: GET /products/:id
    // ----------------------------------------------------------------------------
    const singleProductMatch = cleanPath.match(/^\/products\/(\d+|[a-z0-9-]+)$/);
    if (singleProductMatch) {
      const idOrSlug = singleProductMatch[1];
      const allProducts = DemoStore.getProducts();
      const p = allProducts.find(item => item.id == idOrSlug || item.slug === idOrSlug) || allProducts[0];
      const related = allProducts.filter(item => item.department === p.department && item.id !== p.id).slice(0, 4);
      return {
        success: true,
        data: {
          ...p,
          related,
          reviews: p.reviews || [
            { id: 1, title: 'Superb quality and premium finish', comment: 'Delivered to Bengaluru in 2 days. The craftsmanship is flawless and grounds our living space.', rating: 5, user_name: 'Aditya Sharma', created_at: new Date() },
            { id: 2, title: 'Worth every rupee', comment: 'Exceeded expectations. Packaging was robust with wooden crating and installation technician was courteous.', rating: 5, user_name: 'Priyanka Iyer', created_at: new Date() }
          ]
        }
      };
    }

    // ----------------------------------------------------------------------------
    // 10. Categories: GET /categories
    // ----------------------------------------------------------------------------
    if (cleanPath === '/categories') {
      const dept = params.get('department');
      let cats = [...data.categories];
      if (dept) cats = cats.filter(c => c.department === dept);
      return {
        success: true,
        data: cats
      };
    }

    // ----------------------------------------------------------------------------
    // 11. Cart Validation: POST /cart/validate
    // ----------------------------------------------------------------------------
    if (cleanPath === '/cart/validate') {
      const items = body.items || [];
      const couponCode = (body.coupon_code || '').toUpperCase();
      const allProducts = DemoStore.getProducts();

      let subtotal = 0;
      let totalItems = 0;
      const validatedItems = items.map(item => {
        const p = allProducts.find(x => x.id === Number(item.product_id)) || {
          id: item.product_id,
          name: 'Designer Piece',
          price: 24999,
          department: 'electronics'
        };
        const price = Number(p.price) || 24999;
        const qty = Number(item.quantity) || 1;
        const lineTotal = price * qty;
        subtotal += lineTotal;
        totalItems += qty;
        return {
          product_id: p.id,
          variant_id: item.variant_id || null,
          name: p.name,
          price: price,
          quantity: qty,
          line_total: lineTotal,
          department: p.department,
          image_url: p.primary_image || (p.department === 'furniture' ? 'assets/images/sofa.jpg' : 'assets/images/headphone.jpg')
        };
      });

      let discount = 0;
      let appliedCoupon = null;
      if (couponCode === 'WELCOME10' && subtotal >= 4999) {
        discount = Math.round(subtotal * 0.10);
        appliedCoupon = { code: 'WELCOME10', description: '10% Welcome Privilege', discount_amount: discount };
      } else if (couponCode === 'NOVA500' && subtotal >= 9999) {
        discount = 500;
        appliedCoupon = { code: 'NOVA500', description: 'Flat ₹500 Off', discount_amount: discount };
      } else if ((couponCode === 'NOVA15' || couponCode === 'FESTIVE15') && subtotal >= 19999) {
        discount = Math.round(subtotal * 0.15);
        appliedCoupon = { code: 'NOVA15', description: '15% Atelier Privilege', discount_amount: discount };
      }

      // Free shipping for orders above ₹4,999
      const shippingFee = (subtotal - discount) >= 4999 || subtotal === 0 ? 0 : 499;
      // GST 18% included in total
      const gst = Math.round((subtotal - discount) * 0.18);
      const total = Math.max(0, subtotal - discount + shippingFee);

      return {
        success: true,
        data: {
          items: validatedItems,
          item_count: totalItems,
          subtotal: subtotal,
          discount: discount,
          shipping_fee: shippingFee,
          gst: gst,
          total: total,
          applied_coupon: appliedCoupon
        }
      };
    }

    // ----------------------------------------------------------------------------
    // 12. Checkout & Order Placement: POST /orders
    // ----------------------------------------------------------------------------
    if (cleanPath === '/orders' && method === 'POST') {
      const currentUser = DemoStore.getCurrentUser();
      const customer = body.customer || {};
      const allProducts = DemoStore.getProducts();

      // Retrieve items from Cart
      let cartItems = [];
      try {
        cartItems = JSON.parse(localStorage.getItem('nest_nova_cart')) || [];
      } catch (e) {}

      const orderItems = cartItems.map(item => {
        const prod = allProducts.find(p => p.id === Number(item.product_id)) || {
          id: item.product_id,
          name: 'Atelier Selection',
          price: 24999,
          department: 'electronics',
          primary_image: 'assets/images/headphone.jpg'
        };
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(prod.price) || 24999;
        return {
          product_id: prod.id,
          product_name: prod.name,
          variant_id: item.variant_id || null,
          quantity: qty,
          unit_price: unitPrice,
          subtotal_price: unitPrice * qty,
          image_url: prod.primary_image || (prod.department === 'furniture' ? 'assets/images/sofa.jpg' : 'assets/images/headphone.jpg')
        };
      });

      const uniqueOrderNumber = 'NN-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
      const guestToken = 'nn_token_' + Math.random().toString(36).substring(2, 15);

      const demoOrder = {
        id: Date.now(),
        order_number: uniqueOrderNumber,
        user_id: currentUser ? currentUser.id : null,
        customer_name: customer.name || (currentUser ? currentUser.full_name : 'Valued Collector'),
        email: customer.email || (currentUser ? currentUser.email : 'customer@nestandnova.com'),
        phone: customer.phone || (currentUser ? currentUser.phone : '+91 98450 12345'),
        total_amount: Number(body.total) || 24999,
        payment_status: 'paid',
        payment_method: body.payment_method || 'UPI / Prepaid',
        shipping_method: body.shipping_method || 'White-Glove Express Courier',
        status: 'processing',
        shipping_address: customer,
        tracking_number: 'BLR-EXP-' + Math.floor(100000 + Math.random() * 900000),
        created_at: new Date().toISOString(),
        guest_access_token: guestToken,
        items: orderItems
      };

      const orders = DemoStore.getOrders();
      orders.unshift(demoOrder);
      DemoStore.saveOrders(orders);

      return {
        success: true,
        message: 'Order placed successfully. Thank you for shopping with NEST & NOVA!',
        order: demoOrder
      };
    }

    // ----------------------------------------------------------------------------
    // 13. Customer Order History: GET /orders
    // ----------------------------------------------------------------------------
    if (cleanPath === '/orders' && method === 'GET') {
      const currentUser = DemoStore.getCurrentUser();
      const allOrders = DemoStore.getOrders();

      if (!currentUser) {
        return {
          success: true,
          data: allOrders.slice(0, 2)
        };
      }

      if (currentUser.role === 'admin') {
        return {
          success: true,
          data: allOrders
        };
      }

      const customerOrders = allOrders.filter(
        o => (o.user_id && o.user_id === currentUser.id) ||
             (o.email && o.email.toLowerCase() === currentUser.email.toLowerCase())
      );

      return {
        success: true,
        data: customerOrders.length > 0 ? customerOrders : allOrders.slice(0, 1)
      };
    }

    // ----------------------------------------------------------------------------
    // 14. Admin Dashboard Overview: GET /admin/dashboard
    // ----------------------------------------------------------------------------
    if (cleanPath === '/admin/dashboard') {
      const orders = DemoStore.getOrders();
      const products = DemoStore.getProducts();
      const users = DemoStore.getUsers();

      const totalOrders = orders.length;
      const totalSales = orders
        .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const totalCustomers = users.filter(u => u.role === 'customer').length;
      const totalProducts = products.length;
      const lowStock = products.filter(p => Number(p.stock_quantity || 0) <= 5);

      const electronicsCount = products.filter(p => (p.department || '').toLowerCase() === 'electronics').length;
      const furnitureCount = products.filter(p => (p.department || '').toLowerCase() === 'furniture').length;

      return {
        success: true,
        stats: {
          totalSales: Number(totalSales.toFixed(2)),
          totalOrders: totalOrders,
          totalCustomers: totalCustomers,
          totalProducts: totalProducts,
          lowStockCount: lowStock.length,
          departmentBreakdown: {
            electronics: electronicsCount,
            furniture: furnitureCount
          }
        },
        lowStockProducts: lowStock,
        recentOrders: orders.slice(0, 5)
      };
    }

    // ----------------------------------------------------------------------------
    // 15. Admin Products Management: GET & POST /admin/products
    // ----------------------------------------------------------------------------
    if (cleanPath === '/admin/products') {
      if (method === 'GET') {
        const products = DemoStore.getProducts();
        return {
          success: true,
          data: products
        };
      }

      if (method === 'POST') {
        const products = DemoStore.getProducts();
        const name = (body.name || '').trim();
        const dept = (body.department || 'electronics').toLowerCase();
        const price = parseFloat(body.price) || 9999;
        const origPrice = parseFloat(body.original_price) || Math.round(price * 1.15);
        const stock = parseInt(body.stock_quantity, 10) || 12;
        const categoryId = parseInt(body.category_id, 10) || (dept === 'furniture' ? 10 : 1);
        const shortDesc = body.short_description || 'Artisanal high-performance piece.';
        const desc = body.description || shortDesc;

        let imageUrl = body.image_url;
        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
          imageUrl = dept === 'furniture' ? 'assets/images/sofa.jpg' : 'assets/images/headphone.jpg';
        }

        const nextId = Math.max(...products.map(p => Number(p.id) || 0), 22) + 1;
        const newProduct = {
          id: nextId,
          name: name || `Nest & Nova Bespoke ${dept === 'furniture' ? 'Lounge Piece' : 'Audio Device'}`,
          slug: (name || 'bespoke-piece').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + nextId,
          brand_id: 1,
          brand_name: 'NEST & NOVA',
          category_id: categoryId,
          category_name: dept === 'furniture' ? 'Sofas' : 'Headphones',
          department: dept,
          sku: 'NN-DEMO-' + nextId,
          short_description: shortDesc,
          description: desc,
          price: price,
          original_price: origPrice,
          discount_percent: Math.round(((origPrice - price) / origPrice) * 100),
          rating: 4.9,
          review_count: 14,
          stock_quantity: stock,
          is_featured: 1,
          is_trending: 1,
          is_new_arrival: 1,
          primary_image: imageUrl,
          images: [imageUrl]
        };

        products.unshift(newProduct);
        DemoStore.saveProducts(products);

        return {
          success: true,
          message: 'Product added successfully to catalog!',
          id: newProduct.id,
          product: newProduct
        };
      }
    }

    // ----------------------------------------------------------------------------
    // 16. Admin Product Update & Delete: PATCH & DELETE /admin/products/:id
    // ----------------------------------------------------------------------------
    const adminProductMatch = cleanPath.match(/^\/admin\/products\/(\d+)$/);
    if (adminProductMatch) {
      const id = parseInt(adminProductMatch[1], 10);
      let products = DemoStore.getProducts();

      if (method === 'PATCH') {
        const idx = products.findIndex(p => p.id === id);
        if (idx !== -1) {
          if (body.name) products[idx].name = body.name;
          if (body.price) products[idx].price = parseFloat(body.price);
          if (body.original_price) products[idx].original_price = parseFloat(body.original_price);
          if (body.stock_quantity) products[idx].stock_quantity = parseInt(body.stock_quantity, 10);
          if (body.short_description) products[idx].short_description = body.short_description;
          if (body.description) products[idx].description = body.description;
          DemoStore.saveProducts(products);
        }
        return {
          success: true,
          message: 'Product updated successfully.'
        };
      }

      if (method === 'DELETE') {
        products = products.filter(p => p.id !== id);
        DemoStore.saveProducts(products);
        return {
          success: true,
          message: 'Product removed successfully.'
        };
      }
    }

    // ----------------------------------------------------------------------------
    // 17. Admin Orders: GET /admin/orders & PATCH /admin/orders/:id/status
    // ----------------------------------------------------------------------------
    if (cleanPath === '/admin/orders') {
      const orders = DemoStore.getOrders();
      return {
        success: true,
        data: orders
      };
    }

    const patchOrderStatusMatch = cleanPath.match(/^\/admin\/orders\/(\d+)\/status$/);
    if (patchOrderStatusMatch && method === 'PATCH') {
      const orderId = parseInt(patchOrderStatusMatch[1], 10);
      const orders = DemoStore.getOrders();
      const ord = orders.find(o => o.id === orderId);
      if (ord) {
        if (body.status) ord.status = body.status;
        if (body.tracking_number) ord.tracking_number = body.tracking_number;
        DemoStore.saveOrders(orders);
      }
      return {
        success: true,
        message: `Order status updated to "${(ord && ord.status) || body.status}".`
      };
    }

    // ----------------------------------------------------------------------------
    // 18. Admin Customers: GET /admin/customers
    // ----------------------------------------------------------------------------
    if (cleanPath === '/admin/customers') {
      const users = DemoStore.getUsers().filter(u => u.role === 'customer');
      const orders = DemoStore.getOrders();

      const enrichedCustomers = users.map(u => {
        const userOrders = orders.filter(
          o => (o.user_id && o.user_id === u.id) || (o.email && o.email.toLowerCase() === u.email.toLowerCase())
        );
        const totalSpent = userOrders
          .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
          .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        return {
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone || '+91 98450 12345',
          role: u.role,
          created_at: u.created_at || '2026-01-15T00:00:00.000Z',
          total_orders: userOrders.length,
          total_spent: totalSpent
        };
      });

      return {
        success: true,
        data: enrichedCustomers
      };
    }

    // ----------------------------------------------------------------------------
    // 19. Contact & Newsletter: POST /inquiry/contact & /inquiry/newsletter
    // ----------------------------------------------------------------------------
    if (cleanPath === '/inquiry/contact') {
      return {
        success: true,
        message: 'Thank you for reaching out! Our dedicated concierge team has received your inquiry and will be in touch shortly.'
      };
    }

    if (cleanPath === '/inquiry/newsletter') {
      return {
        success: true,
        message: 'Namaste! Welcome to Nest & Nova Circle. Use code WELCOME10 on your first order.'
      };
    }

    return null;
  }
};

window.api = api;
