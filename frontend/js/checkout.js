/**
 * NEST & NOVA 2.0 — Indian Checkout & Multi-Payment Flow
 * Features: 6-Digit PIN Validation, Indian Addresses, UPI, Cards, NetBanking, COD
 */

const Checkout = {
  currentStep: 1,
  cartData: null,

  async init() {
    const items = Cart.getItems();
    if (items.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    // Auto-fill logged in user info if available
    const user = await checkAuthStatus();
    if (user) {
      const nameInput = document.getElementById('ship-name');
      const emailInput = document.getElementById('ship-email');
      const phoneInput = document.getElementById('ship-phone');
      if (nameInput) nameInput.value = user.full_name || '';
      if (emailInput) emailInput.value = user.email || '';
      if (phoneInput && user.phone) phoneInput.value = user.phone;
    }

    this.refreshCheckoutSummary();
  },

  async refreshCheckoutSummary() {
    const items = Cart.getItems();
    const coupon = Cart.getCoupon();

    try {
      const res = await api.post('/cart/validate', { items, coupon_code: coupon });
      this.cartData = res.data;

      const summaryContainer = document.getElementById('checkout-items-summary');
      if (summaryContainer) {
        summaryContainer.innerHTML = this.cartData.items.map(item => `
          <div style="display: flex; gap: 14px; margin-bottom: 12px; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <div style="width: 52px; height: 52px; background: var(--warm-cream); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border-color);">
              <img src="${item.image_url}" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.onerror=null; this.src='assets/images/headphones.svg';">
            </div>
            <div style="flex-grow: 1;">
              <strong style="font-size: 0.9rem; color: var(--walnut-brown);">${item.name}</strong>
              <div style="font-size: 0.8rem; color: var(--muted-text);">Qty: ${item.quantity} &bull; ${formatINR(item.price)}</div>
            </div>
            <span style="font-weight: 600; font-size: 0.95rem;">${formatINR(item.line_total)}</span>
          </div>
        `).join('');
      }

      const subtotalEl = document.getElementById('co-subtotal');
      const discountEl = document.getElementById('co-discount');
      const shippingEl = document.getElementById('co-shipping');
      const taxEl = document.getElementById('co-tax');
      const totalEl = document.getElementById('co-total');

      if (subtotalEl) subtotalEl.textContent = formatINR(this.cartData.subtotal);
      if (discountEl) {
        discountEl.textContent = `-${formatINR(this.cartData.discount)}`;
        discountEl.parentElement.style.display = this.cartData.discount > 0 ? 'flex' : 'none';
      }
      if (shippingEl) shippingEl.textContent = this.cartData.shipping_fee === 0 ? 'FREE' : formatINR(this.cartData.shipping_fee);
      if (taxEl) taxEl.textContent = formatINR(this.cartData.gst || (this.cartData.subtotal * 0.18));
      if (totalEl) totalEl.textContent = formatINR(this.cartData.total);
    } catch (err) {
      showToast('Error recalculating checkout.', 'error');
    }
  },

  async handlePinInput(pin) {
    if (pin.length === 6) {
      const pinMsg = document.getElementById('pin-validation-msg');
      try {
        const res = await api.get('/pincode/check', { code: pin });
        if (res.serviceable) {
          if (pinMsg) pinMsg.innerHTML = `<span style="color: var(--success-color); font-size: 0.82rem;"><i class="fa-solid fa-check"></i> Standard Delivery to ${res.city}, ${res.state} (${res.delivery_days} days)</span>`;
          const cityInput = document.getElementById('ship-city');
          const stateInput = document.getElementById('ship-state');
          if (cityInput && res.city !== 'India') cityInput.value = res.city;
          if (stateInput && res.state !== 'Standard Region') stateInput.value = res.state;
        } else {
          if (pinMsg) pinMsg.innerHTML = `<span style="color: var(--error-color); font-size: 0.82rem;"><i class="fa-solid fa-xmark"></i> ${res.message}</span>`;
        }
      } catch (e) {}
    }
  },

  goToStep(stepNumber) {
    if (stepNumber === 2) {
      const name = document.getElementById('ship-name')?.value.trim();
      const phone = document.getElementById('ship-phone')?.value.trim();
      const address = document.getElementById('ship-address')?.value.trim();
      const city = document.getElementById('ship-city')?.value.trim();
      const state = document.getElementById('ship-state')?.value.trim();
      const zip = document.getElementById('ship-zip')?.value.trim();

      if (!name || !phone || !address || !city || !state || !zip) {
        showToast('Please fill out all required Indian address fields.', 'error');
        return;
      }

      if (phone.replace(/\D/g, '').length < 10) {
        showToast('Please enter a valid 10-digit Indian mobile number.', 'error');
        return;
      }

      if (zip.length !== 6 || !/^\d+$/.test(zip)) {
        showToast('Please enter a valid 6-digit Indian PIN code.', 'error');
        return;
      }
    }

    this.currentStep = stepNumber;

    document.querySelectorAll('.checkout-step-panel').forEach(p => p.style.display = 'none');
    const targetPanel = document.getElementById(`step-panel-${stepNumber}`);
    if (targetPanel) targetPanel.style.display = 'block';

    document.querySelectorAll('.checkout-step').forEach(step => {
      const num = parseInt(step.dataset.step, 10);
      step.classList.remove('active', 'completed');
      if (num === stepNumber) step.classList.add('active');
      if (num < stepNumber) step.classList.add('completed');
    });

    window.scrollTo({ top: 120, behavior: 'smooth' });
  },

  selectPaymentTab(method) {
    document.querySelectorAll('.pay-method-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pay-subpanel').forEach(p => p.style.display = 'none');

    const activeTab = document.getElementById(`pay-tab-${method}`);
    const activePanel = document.getElementById(`pay-subpanel-${method}`);
    if (activeTab) activeTab.classList.add('active');
    if (activePanel) activePanel.style.display = 'block';
  },

  fillTestCard() {
    const numInput = document.getElementById('pay-card-num');
    const expInput = document.getElementById('pay-card-exp');
    const cvvInput = document.getElementById('pay-card-cvv');
    const nameInput = document.getElementById('pay-card-name');

    if (numInput) numInput.value = '4532 0150 0000 8824';
    if (expInput) expInput.value = '08/29';
    if (cvvInput) cvvInput.value = '321';
    if (nameInput) nameInput.value = 'Aditya Sharma';

    showToast('Sandbox test card details inserted.', 'info');
  },

  async submitOrder() {
    const submitBtn = document.getElementById('btn-submit-order');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-lock fa-spin"></i> Processing Secure Payment in INR...';

    try {
      const items = Cart.getItems();
      const coupon = Cart.getCoupon();

      const selectedPaymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'UPI';

      const orderPayload = {
        items,
        coupon_code: coupon,
        customer_name: document.getElementById('ship-name').value.trim(),
        customer_email: document.getElementById('ship-email').value.trim(),
        customer_phone: document.getElementById('ship-phone')?.value.trim(),
        shipping_address: {
          fullName: document.getElementById('ship-name').value.trim(),
          phone: document.getElementById('ship-phone')?.value.trim(),
          addressLine1: document.getElementById('ship-address').value.trim(),
          addressLine2: document.getElementById('ship-address-2')?.value.trim() || '',
          landmark: document.getElementById('ship-landmark')?.value.trim() || '',
          city: document.getElementById('ship-city').value.trim(),
          state: document.getElementById('ship-state').value.trim(),
          postalCode: document.getElementById('ship-zip').value.trim(),
          country: 'India',
          addressType: document.querySelector('input[name="address_type"]:checked')?.value || 'Home'
        },
        shipping_method: 'White-Glove Express Courier',
        payment_method: selectedPaymentMethod,
        total: this.cartData ? this.cartData.total : 49999
      };

      const res = await api.post('/orders', orderPayload);

      if (res.success && res.order) {
        if (res.order.guest_access_token) {
          sessionStorage.setItem('nn_order_token', res.order.guest_access_token);
          sessionStorage.setItem('nn_order_token_' + res.order.order_number, res.order.guest_access_token);
        }
        Cart.clear();
        this.showConfirmation(res.order, orderPayload);
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      showToast(err.message || 'Payment processing failed. Please check details.', 'error');
    }
  },

  showConfirmation(order, payload = {}) {
    const container = document.getElementById('checkout-main-area');
    if (!container) return;

    container.innerHTML = `
      <div style="background-color: var(--pure-white); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 50px 30px; text-align: center; max-width: 720px; margin: 40px auto; box-shadow: var(--shadow-card);">
        <div style="width: 76px; height: 76px; border-radius: var(--radius-full); background-color: var(--light-sage); color: var(--dark-sage); display: flex; align-items: center; justify-content: center; font-size: 2.4rem; margin: 0 auto 20px;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h1 style="font-size: 2.2rem; color: var(--walnut-brown); margin-bottom: 8px;">Order Confirmed!</h1>
        <p style="font-size: 1.05rem; color: var(--muted-text); margin-bottom: 28px;">Dhanyavaad! Your order has been registered and is being prepared with white-glove care.</p>

        <div style="background-color: var(--warm-cream); border-radius: var(--radius-md); padding: 24px; text-align: left; margin-bottom: 30px; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
            <span style="color: var(--muted-text);">Order ID</span>
            <strong style="color: var(--walnut-brown); font-family: monospace; font-size: 1rem;">${order.order_number}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
            <span style="color: var(--muted-text);">Total Amount Paid</span>
            <strong style="color: var(--walnut-brown); font-size: 1.15rem;">${formatINR(order.total_amount)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
            <span style="color: var(--muted-text);">Payment Mode</span>
            <span class="card-badge badge-department">${order.payment_method || 'UPI / Prepaid'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--muted-text);">Reference Transaction ID</span>
            <span style="font-family: monospace; font-size: 0.85rem; color: var(--main-text);">${order.transaction_id}</span>
          </div>
        </div>

        <p style="font-size: 0.88rem; color: var(--muted-text); line-height: 1.6; margin-bottom: 30px;">
          An official tax invoice and courier live-tracking updates will be sent via SMS to <strong>${payload.customer_phone || '+91 98765 43210'}</strong> and your registered email.
        </p>

        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <a href="index.html" class="btn btn-primary"><i class="fa-solid fa-house"></i> Return to Storefront</a>
          <button class="btn btn-outline" onclick="window.print()"><i class="fa-solid fa-print"></i> Download Tax Invoice</button>
        </div>
      </div>
    `;
  }
};

window.Checkout = Checkout;
