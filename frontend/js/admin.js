/**
 * NEST & NOVA — Admin Control Panel
 */

const formatPrice = (amt) => (typeof formatINR === 'function' ? formatINR(amt) : `₹${Number(amt || 0).toLocaleString('en-IN')}`);

const Admin = {
  async guard() {
    try {
      const res = await api.get('/auth/me');
      if (!res.success || !res.user || res.user.role !== 'admin') {
        showToast('Administrative privileges required.', 'error');
        window.location.href = '../login.html?redirect=admin/index.html';
        return false;
      }
      const adminNameEl = document.getElementById('admin-profile-name');
      if (adminNameEl) adminNameEl.textContent = res.user.full_name;
      return true;
    } catch (err) {
      window.location.href = '../login.html?redirect=admin/index.html';
      return false;
    }
  },

  // 1. Dashboard Overview
  async loadDashboard() {
    if (!(await this.guard())) return;

    try {
      const res = await api.get('/admin/dashboard');
      const { stats, lowStockProducts, recentOrders } = res;

      // Update KPI Cards
      document.getElementById('stat-sales').textContent = formatPrice(stats.totalSales);
      document.getElementById('stat-orders').textContent = stats.totalOrders;
      document.getElementById('stat-customers').textContent = stats.totalCustomers;
      document.getElementById('stat-products').textContent = stats.totalProducts;

      // Low Stock Alert Banner
      const lowStockEl = document.getElementById('low-stock-alert-box');
      if (lowStockEl && lowStockProducts.length > 0) {
        lowStockEl.style.display = 'block';
        document.getElementById('low-stock-count').textContent = lowStockProducts.length;
      }

      // Render Recent Orders
      const recentOrdersTbody = document.getElementById('recent-orders-tbody');
      if (recentOrdersTbody) {
        recentOrdersTbody.innerHTML = recentOrders.map(o => `
          <tr>
            <td><strong>${o.order_number}</strong></td>
            <td>${o.customer_name}</td>
            <td>${new Date(o.created_at).toLocaleDateString('en-IN')}</td>
            <td>${formatPrice(o.total_amount)}</td>
            <td><span class="badge-status ${o.status}">${o.status.toUpperCase()}</span></td>
            <td><a href="orders.html" class="btn btn-outline btn-sm">View</a></td>
          </tr>
        `).join('');
      }
    } catch (err) {
      showToast('Failed to load dashboard metrics.', 'error');
    }
  },

  // 2. Product Management
  async loadProducts() {
    if (!(await this.guard())) return;

    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    try {
      const res = await api.get('/admin/products');
      const products = res.data;

      tbody.innerHTML = products.map(p => {
        const itemImg = (typeof window.getAssetPath === 'function') ? window.getAssetPath(p.primary_image || 'assets/images/headphones.svg') : (p.primary_image || '../assets/images/headphones.svg');
        return `
        <tr>
          <td style="width: 60px;">
            <div style="width: 48px; height: 48px; background: var(--warm-cream); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border-color);">
              <img src="${itemImg}" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.onerror=null; this.src='../assets/images/headphones.svg';">
            </div>
          </td>
          <td>
            <strong>${p.name}</strong>
            <div style="font-size: 0.78rem; color: var(--muted-text);">SKU: ${p.sku} &bull; ${p.brand_name || 'Nest & Nova'}</div>
          </td>
          <td><span class="card-badge badge-department">${p.department}</span></td>
          <td>${p.category_name}</td>
          <td><strong>${formatPrice(p.price)}</strong></td>
          <td>
            <span style="font-weight: 600; color: ${p.stock_quantity <= 5 ? 'var(--warning-color)' : 'var(--main-text)'};">
              ${p.stock_quantity} units
            </span>
          </td>
          <td>
            <div class="table-actions">
              <a href="../product.html?id=${p.id}" target="_blank" class="btn-icon-action" title="View in Store"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
              <button class="btn-icon-action" onclick="Admin.openEditModal(${p.id})" title="Edit Details"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="btn-icon-action delete" onclick="Admin.deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')" title="Delete Product"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;}).join('');
    } catch (err) {
      showToast('Error loading product catalog.', 'error');
    }
  },

  openAddModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      document.getElementById('modal-product-id').value = '';
      document.getElementById('product-form').reset();
      document.getElementById('modal-product-title').textContent = 'Add New Collection Piece';
      modal.classList.add('active');
    }
  },

  async openEditModal(productId) {
    try {
      const res = await api.get(`/products/${productId}`);
      const p = res.data;
      const modal = document.getElementById('product-modal');
      if (!modal) return;

      document.getElementById('modal-product-id').value = p.id;
      document.getElementById('prod-name').value = p.name;
      document.getElementById('prod-dept').value = p.department;
      document.getElementById('prod-category').value = p.category_id;
      document.getElementById('prod-price').value = p.price;
      document.getElementById('prod-original-price').value = p.original_price || '';
      document.getElementById('prod-stock').value = p.stock_quantity;
      document.getElementById('prod-short-desc').value = p.short_description || '';
      document.getElementById('prod-desc').value = p.description || '';

      document.getElementById('modal-product-title').textContent = `Edit: ${p.name}`;
      modal.classList.add('active');
    } catch (err) {
      showToast('Failed to retrieve product details.', 'error');
    }
  },

  closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('active');
  },

  async handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('modal-product-id').value;
    const form = document.getElementById('product-form');
    const formData = new FormData(form);

    try {
      if (id) {
        // Update product
        const payload = {
          name: document.getElementById('prod-name').value,
          price: document.getElementById('prod-price').value,
          original_price: document.getElementById('prod-original-price').value,
          stock_quantity: document.getElementById('prod-stock').value,
          short_description: document.getElementById('prod-short-desc').value,
          description: document.getElementById('prod-desc').value
        };
        await api.patch(`/admin/products/${id}`, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        // Create product
        await api.post('/admin/products', formData);
        showToast('Product added successfully!', 'success');
      }
      this.closeModal();
      this.loadProducts();
    } catch (err) {
      showToast(err.message || 'Operation failed.', 'error');
    }
  },

  async deleteProduct(id, name) {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showToast('Product deleted.', 'info');
      this.loadProducts();
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    }
  },

  // 3. Orders Management
  async loadOrders() {
    if (!(await this.guard())) return;

    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    try {
      const res = await api.get('/admin/orders');
      const orders = res.data;

      tbody.innerHTML = orders.map(o => `
        <tr>
          <td><strong>${o.order_number}</strong></td>
          <td>
            <strong>${o.customer_name}</strong>
            <div style="font-size: 0.78rem; color: var(--muted-text);">${o.customer_email}</div>
          </td>
          <td>${new Date(o.created_at).toLocaleDateString('en-IN')}</td>
          <td><strong>${formatPrice(o.total_amount)}</strong></td>
          <td>
            <select class="form-control" style="padding: 4px 8px; font-size: 0.82rem; font-weight: 600;" onchange="Admin.updateOrderStatus(${o.id}, this.value)">
              <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <input type="text" class="form-control" style="padding: 4px 8px; font-size: 0.8rem;" value="${o.tracking_number || ''}" placeholder="Enter Tracking" onblur="Admin.updateTracking(${o.id}, this.value, '${o.status}')">
          </td>
        </tr>
      `).join('');
    } catch (err) {
      showToast('Error loading orders.', 'error');
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      showToast(`Order #${orderId} status set to ${status}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  },

  async updateTracking(orderId, tracking, currentStatus) {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: currentStatus, tracking_number: tracking });
      showToast('Tracking number updated.', 'success');
    } catch (err) {
      showToast('Failed to update tracking.', 'error');
    }
  },

  // 4. Customers Management
  async loadCustomers() {
    if (!(await this.guard())) return;

    const tbody = document.getElementById('admin-customers-tbody');
    if (!tbody) return;

    try {
      const res = await api.get('/admin/customers');
      const customers = res.data;

      tbody.innerHTML = customers.map(c => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="admin-avatar">${c.full_name.charAt(0)}</div>
              <div>
                <strong>${c.full_name}</strong>
                <div style="font-size: 0.78rem; color: var(--muted-text);">${c.role.toUpperCase()}</div>
              </div>
            </div>
          </td>
          <td>${c.email}</td>
          <td>${c.phone || '—'}</td>
          <td><strong>${c.total_orders || 0}</strong> orders</td>
          <td><strong>${formatPrice(c.total_spent || 0)}</strong></td>
          <td>${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
        </tr>
      `).join('');
    } catch (err) {
      showToast('Error loading customers.', 'error');
    }
  }
};

window.Admin = Admin;
