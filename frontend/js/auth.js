/**
 * NEST & NOVA — Authentication & Account Manager
 */

const Auth = {
  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';

    try {
      const res = await api.post('/auth/login', { email, password });
      showToast(res.message || 'Welcome back to Nest & Nova!', 'success');

      // Check redirect query param
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');

      setTimeout(() => {
        if (res.user.role === 'admin') {
          window.location.href = 'admin/index.html';
        } else if (redirect) {
          window.location.href = decodeURIComponent(redirect);
        } else {
          window.location.href = 'account.html';
        }
      }, 800);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      showToast(err.message || 'Invalid credentials.', 'error');
    }
  },

  async handleRegister(event) {
    event.preventDefault();
    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const phone = document.getElementById('reg-phone')?.value.trim();
    const submitBtn = document.getElementById('reg-submit-btn');

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...';

    try {
      const res = await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        phone
      });
      showToast(res.message || 'Account created successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'account.html';
      }, 1000);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      showToast(err.message || 'Registration failed.', 'error');
    }
  },

  async logout() {
    const inAdmin = window.location.pathname.includes('/admin');
    const target = inAdmin ? '../login.html' : 'login.html';
    try {
      await api.post('/auth/logout');
      showToast('You have been safely signed out.', 'info');
      setTimeout(() => {
        window.location.href = target;
      }, 600);
    } catch (e) {
      window.location.href = target;
    }
  },

  async loadAccountDashboard() {
    const user = await checkAuthStatus();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // Populate user profile info
    const nameEl = document.getElementById('account-full-name');
    const emailEl = document.getElementById('account-email');
    const phoneEl = document.getElementById('account-phone');
    if (nameEl) nameEl.textContent = user.full_name;
    if (emailEl) emailEl.textContent = user.email;
    if (phoneEl) phoneEl.textContent = user.phone || 'No phone added';

    // Load user orders
    this.loadUserOrders();
  },

  async loadUserOrders() {
    const ordersContainer = document.getElementById('user-orders-list');
    if (!ordersContainer) return;

    try {
      const res = await api.get('/orders');
      const orders = res.data || [];

      if (orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon"><i class="fa-solid fa-box-open"></i></div>
            <h3 class="empty-state-title">No Orders Placed Yet</h3>
            <p class="empty-state-desc">Your order history and live shipping updates will appear here once you make your first purchase.</p>
            <a href="index.html" class="btn btn-primary btn-sm">Start Exploring</a>
          </div>
        `;
        return;
      }

      ordersContainer.innerHTML = orders.map(o => {
        const itemsSummary = (o.items || []).map(i => `
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 10px;">
            <img src="${i.image_url || 'assets/images/headphones.svg'}" style="width: 50px; height: 50px; border-radius: 6px; object-fit: contain; background: var(--warm-cream);" onerror="this.onerror=null; this.src='assets/images/headphones.svg';">
            <div style="flex-grow: 1;">
              <strong style="font-size: 0.92rem; color: var(--walnut-brown);">${i.product_name}</strong>
              <div style="font-size: 0.8rem; color: var(--muted-text);">Qty: ${i.quantity} &bull; ${window.formatINR ? window.formatINR(i.unit_price) : '₹' + i.unit_price} ea</div>
            </div>
          </div>
        `).join('');

        // Flipkart-style order tracking stage determination
        const isDelivered = o.status === 'delivered';
        const isShipped = o.status === 'shipped' || isDelivered;
        const isConfirmed = o.status === 'processing' || isShipped;

        const timelineHtml = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 18px 0 14px; position: relative; padding: 0 10px;">
            <div style="position: absolute; top: 12px; left: 24px; right: 24px; height: 2px; background: var(--border-color); z-index: 1;"></div>
            <div style="position: absolute; top: 12px; left: 24px; width: ${isDelivered ? '100%' : isShipped ? '66%' : isConfirmed ? '33%' : '0%'}; height: 2px; background: var(--primary-sage); z-index: 2; transition: width 0.4s ease;"></div>
            
            <div style="position: relative; z-index: 3; text-align: center;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary-sage); color: #fff; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px;">
                <i class="fa-solid fa-check"></i>
              </div>
              <span style="font-size: 0.72rem; color: var(--walnut-brown); font-weight: 600;">Ordered</span>
            </div>

            <div style="position: relative; z-index: 3; text-align: center;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: ${isConfirmed ? 'var(--primary-sage)' : '#E0E0DB'}; color: #fff; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px;">
                <i class="fa-solid fa-box"></i>
              </div>
              <span style="font-size: 0.72rem; color: ${isConfirmed ? 'var(--walnut-brown)' : 'var(--muted-text)'}; font-weight: 600;">Packed</span>
            </div>

            <div style="position: relative; z-index: 3; text-align: center;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: ${isShipped ? 'var(--primary-sage)' : '#E0E0DB'}; color: #fff; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px;">
                <i class="fa-solid fa-truck-fast"></i>
              </div>
              <span style="font-size: 0.72rem; color: ${isShipped ? 'var(--walnut-brown)' : 'var(--muted-text)'}; font-weight: 600;">Shipped</span>
            </div>

            <div style="position: relative; z-index: 3; text-align: center;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: ${isDelivered ? 'var(--primary-sage)' : '#E0E0DB'}; color: #fff; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px;">
                <i class="fa-solid fa-house-chimney"></i>
              </div>
              <span style="font-size: 0.72rem; color: ${isDelivered ? 'var(--walnut-brown)' : 'var(--muted-text)'}; font-weight: 600;">Delivered</span>
            </div>
          </div>
        `;

        return `
          <div style="background-color: var(--pure-white); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; margin-bottom: 20px; box-shadow: var(--shadow-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 16px;">
              <div>
                <span style="font-size: 0.8rem; color: var(--muted-text); text-transform: uppercase;">Order Number</span>
                <h4 style="font-size: 1.15rem; color: var(--walnut-brown);">${o.order_number}</h4>
                <small style="color: var(--muted-text);">${new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; GST Invoice Available</small>
              </div>
              <div style="text-align: right;">
                <span class="badge-status ${o.status}">${o.status.toUpperCase()}</span>
                <div style="font-size: 1.25rem; font-weight: 700; color: var(--walnut-brown); margin-top: 6px;">${window.formatINR ? window.formatINR(o.total_amount) : '₹' + o.total_amount}</div>
              </div>
            </div>

            ${timelineHtml}

            <div>
              ${itemsSummary}
            </div>

            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--muted-text); flex-wrap: wrap; gap: 8px;">
              <span><strong>Tracking #:</strong> ${o.tracking_number || 'NN-DEL-' + o.order_number.replace('NN-', '')}</span>
              <span><strong>Delivery Mode:</strong> ${o.shipping_method || 'White-Glove Pan-India Express'}</span>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      ordersContainer.innerHTML = `<p style="color: var(--error-color);">Failed to load orders: ${err.message}</p>`;
    }
  }
};

window.Auth = Auth;
