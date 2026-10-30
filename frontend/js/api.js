/**
 * NEST & NOVA 2.0 — Universal API Client & Indian Offline Fallback
 * Features: INR Currency, 6-Digit PIN Code Checker, Compare Engine
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

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // If server responded with an HTTP status error (400, 401, 403, 404, 500), throw directly
      // Never mask real server rejections or validation failures
      if (err.status) {
        throw err;
      }

      // Only attempt read-only catalog fallback for GET requests during genuine network failure
      const method = (options.method || 'GET').toUpperCase();
      if (method === 'GET') {
        const fallbackResult = this.offlineFallback(endpoint, options);
        if (fallbackResult !== null) {
          return fallbackResult;
        }
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

  // Instant zero-config offline fallback implementation with Indian Rupee (₹) & PIN checks
  offlineFallback(endpoint, options = {}) {
    const data = window.NEST_NOVA_DATA;
    if (!data) return null;

    const [cleanPath, queryString] = endpoint.split('?');
    const params = new URLSearchParams(queryString || '');

    // 1. PIN Code Checker: GET /pincode/check?code=...
    if (cleanPath === '/pincode/check') {
      const code = params.get('code') || '';
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

    // 2. GET /products or /products/search
    if (cleanPath === '/products' || cleanPath.startsWith('/products/search')) {
      let results = [...data.products];
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
        results = results.filter(p => p.department.toLowerCase() === dept.toLowerCase());
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
          p.name.toLowerCase().includes(q) || 
          p.short_description.toLowerCase().includes(q) || 
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

    // 3. Product Comparison: GET /products/compare?ids=1,2
    if (cleanPath === '/products/compare') {
      const ids = (params.get('ids') || '').split(',').map(Number);
      const items = data.products.filter(p => ids.includes(p.id));
      return {
        success: true,
        data: items
      };
    }

    // 4. Single Product: GET /products/:id
    const singleProductMatch = cleanPath.match(/^\/products\/(\d+|[a-z0-9-]+)$/);
    if (singleProductMatch) {
      const idOrSlug = singleProductMatch[1];
      const p = data.products.find(item => item.id == idOrSlug || item.slug === idOrSlug) || data.products[0];
      const related = data.products.filter(item => item.department === p.department && item.id !== p.id).slice(0, 4);
      return {
        success: true,
        data: {
          ...p,
          related,
          reviews: [
            { id: 1, title: 'Superb quality and premium finish', comment: 'Delivered to Bengaluru in 2 days. The craftsmanship is flawless and grounds our living space.', rating: 5, user_name: 'Aditya Sharma', created_at: new Date() },
            { id: 2, title: 'Worth every rupee', comment: 'Exceeded expectations. Packaging was robust with wooden crating and installation technician was courteous.', rating: 5, user_name: 'Priyanka Iyer', created_at: new Date() }
          ]
        }
      };
    }

    // 5. Categories: GET /categories
    if (cleanPath === '/categories') {
      const dept = params.get('department');
      let cats = [...data.categories];
      if (dept) cats = cats.filter(c => c.department === dept);
      return {
        success: true,
        data: cats
      };
    }

    // 6. Cart Validation: POST /cart/validate
    if (cleanPath === '/cart/validate') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {}); } catch(e){}
      const items = body.items || [];
      const couponCode = (body.coupon_code || '').toUpperCase();

      let subtotal = 0;
      let totalItems = 0;
      const validatedItems = items.map(item => {
        const p = data.products.find(x => x.id === Number(item.product_id)) || {
          id: item.product_id,
          name: 'Designer Piece',
          price: 24999,
          department: 'electronics'
        };
        const price = p.price;
        const qty = item.quantity || 1;
        const lineTotal = price * qty;
        subtotal += lineTotal;
        totalItems += qty;
        return {
          product_id: p.id,
          variant_id: item.variant_id,
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

    // 7. Newsletter: POST /inquiry/newsletter
    if (cleanPath === '/inquiry/newsletter') {
      return { success: true, message: 'Namaste! Welcome to Nest & Nova Circle. Use code WELCOME10 on your first order.' };
    }

    return null;
  }
};

window.api = api;
