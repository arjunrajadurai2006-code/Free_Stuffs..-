/**
 * NEST & NOVA 2.0 — Shopping Cart Management (INR Currency)
 */

const safeToast = (msg, type = 'info') => {
  if (typeof showToast === 'function') {
    showToast(msg, type);
  } else if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast(msg, type);
  } else {
    console.log(`[${type}]`, msg);
  }
};

const Cart = {
  storageKey: 'nest_nova_cart',
  couponKey: 'nest_nova_coupon',

  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (e) {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.updateBadges();
  },

  getCoupon() {
    return localStorage.getItem(this.couponKey) || null;
  },

  setCoupon(code) {
    if (code) {
      localStorage.setItem(this.couponKey, code);
    } else {
      localStorage.removeItem(this.couponKey);
    }
  },

  async add(productId, variantId = null, quantity = 1, options = {}) {
    const items = this.getItems();
    const existingIndex = items.findIndex(
      item => Number(item.product_id) === Number(productId) && Number(item.variant_id) === Number(variantId)
    );

    if (existingIndex > -1) {
      items[existingIndex].quantity += parseInt(quantity, 10);
    } else {
      items.push({
        product_id: Number(productId),
        variant_id: variantId ? Number(variantId) : null,
        quantity: parseInt(quantity, 10)
      });
    }

    this.saveItems(items);
    safeToast(options.name ? `Added "${options.name}" to bag.` : 'Product added to shopping bag!', 'success');

    // Trigger cart page reload if currently on cart page
    if (window.location.pathname.includes('cart.html')) {
      this.renderCartPage();
    }
  },

  updateQuantity(productId, variantId, newQuantity) {
    let items = this.getItems();
    const index = items.findIndex(
      item => Number(item.product_id) === Number(productId) && Number(item.variant_id) === Number(variantId)
    );

    if (index > -1) {
      if (newQuantity <= 0) {
        items.splice(index, 1);
        safeToast('Item removed from shopping bag.', 'info');
      } else {
        items[index].quantity = parseInt(newQuantity, 10);
      }
      this.saveItems(items);
      this.renderCartPage();
    }
  },

  remove(productId, variantId) {
    let items = this.getItems();
    items = items.filter(
      item => !(Number(item.product_id) === Number(productId) && Number(item.variant_id) === Number(variantId))
    );
    this.saveItems(items);
    safeToast('Item removed from shopping bag.', 'info');
    this.renderCartPage();
  },

  clear() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.couponKey);
    this.updateBadges();
  },

  updateBadges() {
    const items = this.getItems();
    const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll('.cart-counter');
    badges.forEach(b => {
      b.textContent = totalCount;
      b.style.display = totalCount > 0 ? 'flex' : 'none';
    });
  },

  // Server-side calculation & rendering for cart.html
  async renderCartPage() {
    const container = document.getElementById('cart-view-container');
    if (!container) return;

    const items = this.getItems();
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 60px 20px;">
          <div class="empty-state-icon" style="font-size: 3rem; color: var(--primary-sage); margin-bottom: 20px;"><i class="fa-solid fa-bag-shopping"></i></div>
          <h2 class="empty-state-title" style="font-size: 1.8rem; color: var(--walnut-brown); margin-bottom: 12px;">Your Shopping Bag is Empty</h2>
          <p class="empty-state-desc" style="color: var(--muted-text); max-width: 480px; margin: 0 auto 28px;">Explore our curated collections of advanced acoustics, smartphones, workstations, and timeless timber furniture.</p>
          <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <a href="electronics.html" class="btn btn-primary"><i class="fa-solid fa-microchip"></i> Explore Electronics</a>
            <a href="furniture.html" class="btn btn-secondary"><i class="fa-solid fa-couch"></i> Browse Furniture</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary-sage);"></i>
        <p style="margin-top: 12px; color: var(--muted-text);">Verifying inventory and calculating GST...</p>
      </div>
    `;

    try {
      const couponCode = this.getCoupon();
      const res = await api.post('/cart/validate', { items, coupon_code: couponCode });
      const summary = res.data;

      const itemsRowsHtml = summary.items.map(item => {
        const itemImg = (typeof ProductsEngine !== 'undefined') 
          ? ProductsEngine.resolveImage(item.image_url, null, item.product_id) 
          : (typeof window.getAssetPath === 'function' ? window.getAssetPath(item.image_url || 'assets/images/headphone.jpg') : (item.image_url || 'assets/images/headphone.jpg'));
        
        return `
          <tr class="cart-item-row" style="border-bottom: 1px solid var(--border-color);">
            <td style="width: 100px; padding: 16px 0;">
              <div style="width: 80px; height: 80px; background: var(--warm-cream); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); overflow: hidden;">
                <img src="${itemImg}" alt="${item.name}" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.onerror=null; this.src='assets/images/headphones.svg';">
              </div>
            </td>
            <td style="padding: 16px;">
              <a href="product.html?id=${item.product_id}" style="font-weight: 600; color: var(--walnut-brown); display: block; font-size: 1.05rem; margin-bottom: 4px;">
                ${item.name}
              </a>
              ${item.variant_name ? `<span style="font-size: 0.8rem; color: var(--muted-text); display: block;">Option: ${item.variant_name}</span>` : ''}
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary-sage); font-weight: 700; letter-spacing: 0.5px;">${item.department}</span>
            </td>
            <td style="font-weight: 600; font-size: 1.05rem; padding: 16px;">
              ${formatINR(item.price)}
            </td>
            <td style="padding: 16px;">
              <div class="qty-counter" style="display: inline-flex; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--warm-cream);">
                <button class="qty-btn" onclick="Cart.updateQuantity(${item.product_id}, ${item.variant_id || 'null'}, ${item.quantity - 1})" style="padding: 6px 12px; cursor: pointer; background: transparent;">-</button>
                <span class="qty-display" style="padding: 6px 12px; font-weight: 700;">${item.quantity}</span>
                <button class="qty-btn" onclick="Cart.updateQuantity(${item.product_id}, ${item.variant_id || 'null'}, ${item.quantity + 1})" style="padding: 6px 12px; cursor: pointer; background: transparent;">+</button>
              </div>
            </td>
            <td style="font-weight: 700; color: var(--walnut-brown); font-size: 1.1rem; padding: 16px;">
              ${formatINR(item.line_total)}
            </td>
            <td style="text-align: right; padding: 16px;">
              <button onclick="Cart.remove(${item.product_id}, ${item.variant_id || 'null'})" style="color: var(--muted-text); font-size: 1.1rem; background: transparent; cursor: pointer;" title="Remove Item">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      container.innerHTML = `
        <div class="cart-layout" style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 40px; margin: 40px 0 60px;">
          <div>
            <table class="cart-items-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); text-align: left; font-size: 0.85rem; color: var(--muted-text); text-transform: uppercase;">
                  <th colspan="2" style="padding-bottom: 12px;">Item Details</th>
                  <th style="padding-bottom: 12px;">Price</th>
                  <th style="padding-bottom: 12px;">Quantity</th>
                  <th style="padding-bottom: 12px;">Subtotal</th>
                  <th style="padding-bottom: 12px;"></th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; flex-wrap: wrap; gap: 12px;">
              <a href="index.html" class="btn btn-outline" style="font-size: 0.88rem;">
                <i class="fa-solid fa-arrow-left"></i> Continue Shopping
              </a>
              <button class="btn btn-outline" style="font-size: 0.88rem; color: var(--error-color); border-color: #E2B2AC;" onclick="if(confirm('Clear all items from your shopping bag?')) { Cart.clear(); Cart.renderCartPage(); }">
                <i class="fa-solid fa-trash"></i> Empty Bag
              </button>
            </div>
          </div>

          <div>
            <div class="order-summary-card" style="background: var(--warm-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 28px;">
              <h3 style="font-size: 1.3rem; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; color: var(--walnut-brown);">Price Summary</h3>

              <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem;">
                <span style="color: var(--muted-text);">Price (${summary.item_count} items)</span>
                <span style="font-weight: 600;">${formatINR(summary.subtotal)}</span>
              </div>

              ${summary.discount > 0 ? `
                <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 12px; color: var(--dark-sage); font-weight: 600;">
                  <span>Special Discount (${summary.applied_coupon?.code || 'COUPON'})</span>
                  <span>-${formatINR(summary.discount)}</span>
                </div>
              ` : ''}

              <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem;">
                <span style="color: var(--muted-text);">Delivery Charges</span>
                <span>${summary.shipping_fee === 0 ? '<strong style="color: var(--success-color);">FREE</strong>' : formatINR(summary.shipping_fee)}</span>
              </div>

              <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 0.85rem; color: var(--muted-text);">
                <span>GST (18% inclusive)</span>
                <span>${formatINR(summary.gst || (summary.subtotal * 0.18))}</span>
              </div>

              <div class="summary-row total" style="display: flex; justify-content: space-between; margin: 16px 0; border-top: 1px solid var(--border-color); padding-top: 16px; font-size: 1.35rem; font-weight: 700; color: var(--walnut-brown);">
                <span>Total Amount</span>
                <span>${formatINR(summary.total)}</span>
              </div>

              <!-- Coupon Application Form -->
              <div style="margin: 24px 0; border-top: 1px solid var(--border-color); padding-top: 18px;">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--walnut-brown); margin-bottom: 6px;">Have a Promo Coupon?</label>
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="coupon-code-input" class="form-control" placeholder="e.g. WELCOME10" value="${summary.applied_coupon ? summary.applied_coupon.code : ''}" style="text-transform: uppercase; padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); flex: 1; font-weight: 600;">
                  <button class="btn btn-secondary btn-sm" onclick="Cart.handleCouponSubmit()">Apply</button>
                </div>
                ${summary.applied_coupon ? `
                  <div style="margin-top: 8px; font-size: 0.8rem; color: var(--dark-sage); display: flex; align-items: center; justify-content: space-between;">
                    <span><i class="fa-solid fa-tag"></i> ${summary.applied_coupon.description || summary.applied_coupon.code}</span>
                    <button onclick="Cart.setCoupon(null); Cart.renderCartPage();" style="color: var(--error-color); background: transparent; text-decoration: underline; font-size: 0.75rem; cursor: pointer;">Remove</button>
                  </div>
                ` : `
                  <p style="font-size: 0.75rem; color: var(--muted-text); margin-top: 6px;">Use <strong>WELCOME10</strong> (10% off &gt; ₹4,999) or <strong>NOVA500</strong> (₹500 off &gt; ₹9,999).</p>
                `}
              </div>

              <a href="checkout.html" class="btn btn-primary btn-block btn-lg" style="width: 100%; margin-bottom: 14px; text-align: center; display: block;">
                Proceed to Checkout <i class="fa-solid fa-arrow-right" style="margin-left: 6px;"></i>
              </a>

              <div style="text-align: center; font-size: 0.78rem; color: var(--muted-text); display: flex; align-items: center; justify-content: center; gap: 8px;">
                <i class="fa-solid fa-shield-halved" style="color: var(--primary-sage);"></i> 100% Safe &amp; Secure Checkout &bull; UPI &bull; Cards &bull; COD
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color: var(--error-color);"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h2 class="empty-state-title">Unable to Calculate Cart</h2>
          <p class="empty-state-desc">${err.message || 'Please verify your items or try again.'}</p>
        </div>
      `;
    }
  },

  async handleCouponSubmit() {
    const input = document.getElementById('coupon-code-input');
    if (!input || !input.value.trim()) {
      showToast('Please enter a coupon code.', 'error');
      return;
    }
    const code = input.value.trim().toUpperCase();
    try {
      const items = this.getItems();
      const valRes = await api.post('/cart/validate', { items, coupon_code: code });
      if (valRes.data.applied_coupon) {
        this.setCoupon(code);
        safeToast(`Coupon "${code}" applied successfully!`, 'success');
        this.renderCartPage();
      } else {
        safeToast('Coupon not applicable for current order amount.', 'error');
      }
    } catch (err) {
      safeToast(err.message || 'Invalid coupon code.', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadges();
  if (window.location.pathname.includes('cart.html')) {
    Cart.renderCartPage();
  }
});

window.Cart = Cart;
