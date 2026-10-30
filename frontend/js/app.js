/**
 * NEST & NOVA 2.0 — Main Application State, INR Currency, Compare Engine & Global UI
 */

// Universal Indian Rupee (₹) Formatter
function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
window.formatINR = formatINR;

// Toast Notifications System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-bell');
  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="font-size: 1.2rem; color: ${type === 'success' ? 'var(--dark-sage)' : 'var(--error-color)'};"></i>
    <div style="flex-grow: 1; font-size: 0.92rem;">${message}</div>
    <button style="color: var(--muted-text); background: transparent; cursor: pointer; padding: 4px;" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Current User State & Auth
let currentUser = null;

async function checkAuthStatus() {
  try {
    const res = await api.get('/auth/me');
    if (res.success && res.user) {
      currentUser = res.user;
      updateAuthUI(currentUser);
      return currentUser;
    }
  } catch (e) {
    currentUser = null;
    updateAuthUI(null);
  }
  return null;
}

function updateAuthUI(user) {
  const inAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('\\admin');
  const accountLinks = document.querySelectorAll('.account-nav-link');
  accountLinks.forEach(link => {
    if (user) {
      link.href = user.role === 'admin' 
        ? (inAdmin ? 'index.html' : 'admin/index.html') 
        : (inAdmin ? '../account.html' : 'account.html');
      link.title = `Namaste, ${user.full_name}`;
      if (link.querySelector('.nav-label')) {
        link.querySelector('.nav-label').textContent = user.role === 'admin' ? 'Admin' : 'Account';
      }
    } else {
      link.href = inAdmin ? '../login.html' : 'login.html';
      link.title = 'Sign In / Register';
      if (link.querySelector('.nav-label')) {
        link.querySelector('.nav-label').textContent = 'Sign In';
      }
    }
  });
}

// Wishlist System (LocalStorage with instant reactivity)
const Wishlist = {
  storageKey: 'nest_nova_wishlist',
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (e) {
      return [];
    }
  },
  has(productId) {
    const items = this.getItems();
    return items.some(id => Number(id) === Number(productId));
  },
  toggle(productId, productName = 'Product') {
    let items = this.getItems();
    const id = Number(productId);
    let isNowSaved = false;
    if (items.includes(id)) {
      items = items.filter(x => x !== id);
      showToast(`Removed "${productName}" from your wishlist.`, 'info');
    } else {
      items.push(id);
      showToast(`Saved "${productName}" to your wishlist.`, 'success');
      isNowSaved = true;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.updateBadge();
    return isNowSaved;
  },
  remove(productId) {
    let items = this.getItems().filter(x => Number(x) !== Number(productId));
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.updateBadge();
  },
  clear() {
    localStorage.removeItem(this.storageKey);
    this.updateBadge();
  },
  updateBadge() {
    const items = this.getItems();
    const badges = document.querySelectorAll('.wishlist-counter');
    badges.forEach(b => {
      b.textContent = items.length;
      b.style.display = items.length > 0 ? 'flex' : 'none';
    });
  }
};

// Flipkart-Inspired Product Comparison Engine (For Electronics)
const CompareEngine = {
  storageKey: 'nest_nova_compare',
  maxItems: 4,

  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (e) {
      return [];
    }
  },

  has(productId) {
    return this.getItems().includes(Number(productId));
  },

  toggle(productId, productName = 'Product') {
    let items = this.getItems();
    const id = Number(productId);
    let added = false;

    if (items.includes(id)) {
      items = items.filter(x => x !== id);
      showToast(`Removed "${productName}" from comparison.`, 'info');
    } else {
      if (items.length >= this.maxItems) {
        showToast(`You can compare up to ${this.maxItems} electronics at a time.`, 'error');
        return false;
      }
      items.push(id);
      showToast(`Added "${productName}" to compare.`, 'success');
      added = true;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.renderDrawer();
    return added;
  },

  remove(productId) {
    let items = this.getItems().filter(x => x !== Number(productId));
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.renderDrawer();
    if (items.length === 0) {
      const modal = document.getElementById('compare-modal');
      if (modal) modal.classList.remove('active');
    } else {
      this.openModal();
    }
  },

  clear() {
    localStorage.removeItem(this.storageKey);
    this.renderDrawer();
    const modal = document.getElementById('compare-modal');
    if (modal) modal.classList.remove('active');
  },

  renderDrawer() {
    const items = this.getItems();
    let bar = document.getElementById('compare-floating-bar');

    if (items.length === 0) {
      if (bar) bar.style.display = 'none';
      return;
    }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'compare-floating-bar';
      bar.className = 'compare-floating-bar';
      document.body.appendChild(bar);
    }

    const data = window.NEST_NOVA_DATA;
    const itemObjects = items.map(id => data?.products?.find(p => p.id === id)).filter(Boolean);

    bar.innerHTML = `
      <div class="compare-bar-content">
        <div class="compare-bar-info">
          <i class="fa-solid fa-code-compare"></i>
          <span><strong>Compare Electronics:</strong> ${items.length} of ${this.maxItems} selected</span>
        </div>
        <div class="compare-bar-chips">
          ${itemObjects.map(p => `
            <span class="compare-chip">
              ${p.name.substring(0, 24)}...
              <button onclick="CompareEngine.remove(${p.id})">&times;</button>
            </span>
          `).join('')}
        </div>
        <div class="compare-bar-actions">
          <button class="btn btn-primary btn-sm" onclick="CompareEngine.openModal()">
            <i class="fa-solid fa-table-columns"></i> Compare Now
          </button>
          <button class="btn btn-outline btn-sm" onclick="CompareEngine.clear()">Clear All</button>
        </div>
      </div>
    `;
    bar.style.display = 'block';
  },

  async openModal() {
    const items = this.getItems();
    if (items.length === 0) return;

    let modal = document.getElementById('compare-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'compare-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const res = await api.get('/products/compare', { ids: items.join(',') });
    const products = res.data || [];

    // Extract all unique spec keys
    const specKeys = new Set();
    products.forEach(p => {
      if (p.specifications) {
        const specs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
        Object.keys(specs).forEach(k => specKeys.add(k));
      }
    });

    const headerCells = products.map(p => `
      <th style="width: ${100 / (products.length + 1)}%; vertical-align: top; padding: 16px; border: 1px solid var(--border-color); background: var(--warm-cream);">
        <div style="text-align: right; margin-bottom: 8px;">
          <button onclick="CompareEngine.remove(${p.id})" style="background: transparent; color: var(--muted-text); font-size: 1.1rem; cursor: pointer;">&times;</button>
        </div>
        <div style="height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <img src="${(typeof ProductsEngine !== 'undefined') ? ProductsEngine.resolveImage(p.primary_image, p.category_id, p.id) : 'assets/images/headphone.jpg'}" alt="${p.name}" style="max-height: 100px; max-width: 100%; object-fit: contain;" onerror="this.onerror=null; this.src='assets/images/headphones.svg';">
        </div>
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary-sage); font-weight: 700;">${p.brand_name}</div>
        <h4 style="font-size: 1rem; color: var(--walnut-brown); margin: 4px 0 8px; line-height: 1.3;">${p.name}</h4>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--walnut-brown); margin-bottom: 8px;">${formatINR(p.price)}</div>
        <button class="btn btn-primary btn-sm btn-block" onclick="Cart.add(${p.id}, null, 1); CompareEngine.closeModal();">
          <i class="fa-solid fa-cart-shopping"></i> Add to Bag
        </button>
      </th>
    `).join('');

    const specRows = Array.from(specKeys).map(key => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 12px 16px; font-weight: 600; color: var(--walnut-brown); background: #FAF9F5; border: 1px solid var(--border-color);">${key}</td>
        ${products.map(p => {
          const specs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {});
          return `<td style="padding: 12px 16px; color: var(--main-text); border: 1px solid var(--border-color);">${specs[key] || '—'}</td>`;
        }).join('')}
      </tr>
    `).join('');

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 1100px; width: 95%; max-height: 90vh; overflow-y: auto; background: var(--pure-white); border-radius: var(--radius-lg); padding: 32px; position: relative; box-shadow: var(--shadow-modal);">
        <button class="modal-close-btn" onclick="CompareEngine.closeModal()" style="position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div style="margin-bottom: 24px;">
          <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--primary-sage); font-weight: 700; letter-spacing: 1.5px;">Side-by-Side Analysis</span>
          <h2 style="font-size: 1.8rem; color: var(--walnut-brown); margin: 4px 0;">Technical Specification Comparison</h2>
        </div>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr>
                <th style="padding: 16px; border: 1px solid var(--border-color); background: #FAF9F5; width: 22%;">Attributes</th>
                ${headerCells}
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 12px 16px; font-weight: 600; color: var(--walnut-brown); background: #FAF9F5; border: 1px solid var(--border-color);">User Rating</td>
                ${products.map(p => `<td style="padding: 12px 16px; border: 1px solid var(--border-color);"><span style="color: #C29D59;"><i class="fa-solid fa-star"></i></span> <strong>${Number(p.rating).toFixed(1)}</strong> (${p.review_count} reviews)</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 12px 16px; font-weight: 600; color: var(--walnut-brown); background: #FAF9F5; border: 1px solid var(--border-color);">Warranty</td>
                ${products.map(p => `<td style="padding: 12px 16px; border: 1px solid var(--border-color);">${p.warranty_info || '1-Year Warranty'}</td>`).join('')}
              </tr>
              ${specRows}
            </tbody>
          </table>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.onclick = (e) => {
      if (e.target === modal) CompareEngine.closeModal();
    };
  },

  closeModal() {
    const modal = document.getElementById('compare-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Global Quick View Modal State & Handlers
let quickViewKeyHandler = null;

async function openQuickView(productId) {
  try {
    let p = null;
    try {
      const res = await api.get(`/products/${productId}`);
      if (res && res.success && res.data) {
        p = res.data;
      }
    } catch (apiErr) {
      console.warn('[QuickView] API fetch notice:', apiErr.message);
    }

    // Resilient fallback to pre-rendered catalog data if network request was blocked
    if (!p && window.NEST_NOVA_DATA && Array.isArray(window.NEST_NOVA_DATA.products)) {
      p = window.NEST_NOVA_DATA.products.find(item => item.id === Number(productId));
    }

    if (!p) {
      showToast('Product details unavailable.', 'error');
      return;
    }

    let modal = document.getElementById('quick-view-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'quick-view-modal';
      modal.className = 'modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);
    }

    document.body.style.overflow = 'hidden';

    if (quickViewKeyHandler) {
      document.removeEventListener('keydown', quickViewKeyHandler);
    }
    quickViewKeyHandler = (e) => {
      if (e.key === 'Escape') closeQuickView();
    };
    document.addEventListener('keydown', quickViewKeyHandler);

    const fallbackImg = (typeof ProductsEngine !== 'undefined') ? ProductsEngine.getFallbackSvg(p.category_id, p.id) : 'assets/images/hero-lifestyle.svg';
    const mainImg = (typeof ProductsEngine !== 'undefined') ? ProductsEngine.resolveImage(p.images?.[0]?.image_url || p.primary_image, p.category_id, p.id) : fallbackImg;
    const detailHref = (window.location.pathname.includes('/admin')) ? `../product.html?id=${p.id}` : `product.html?id=${p.id}`;
    const safeName = (p.name || '').replace(/'/g, "\\'");

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 820px; width: 90%; background: var(--pure-white); border-radius: var(--radius-lg); position: relative; overflow: hidden; box-shadow: var(--shadow-modal);">
        <button class="modal-close-btn" onclick="closeQuickView()" style="position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border-radius: var(--radius-full); background: rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10;" aria-label="Close Preview">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 32px; padding: 36px;">
          <div style="border-radius: var(--radius-md); overflow: hidden; height: 360px; background: var(--warm-cream); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; padding: 20px;">
            <img src="${mainImg}" alt="${p.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.onerror=null; this.src='${fallbackImg}';">
          </div>
          <div style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--primary-sage); font-weight: 700; letter-spacing: 1px;">${p.department} &bull; ${p.category_name}</span>
              <h2 style="font-size: 1.5rem; color: var(--walnut-brown); margin: 6px 0 10px; line-height: 1.25;">${p.name}</h2>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                <span class="star-icons" style="color: #C29D59;"><i class="fa-solid fa-star"></i></span>
                <strong style="font-size: 0.9rem;">${Number(p.rating || 4.9).toFixed(1)}</strong>
                <span style="color: var(--muted-text); font-size: 0.85rem;">(${p.review_count || 48} reviews)</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 1.8rem; font-weight: 700; color: var(--walnut-brown);">${formatINR(p.price)}</span>
                ${p.original_price ? `<span style="text-decoration: line-through; color: var(--muted-text); font-size: 1.1rem;">${formatINR(p.original_price)}</span>` : ''}
                ${p.discount_percent > 0 ? `<span class="card-badge badge-discount">-${p.discount_percent}%</span>` : ''}
              </div>
              ${p.emi_starting_at ? `
                <div style="font-size: 0.82rem; color: var(--dark-sage); font-weight: 600; margin-bottom: 16px;">
                  <i class="fa-solid fa-credit-card"></i> No-Cost EMI from ${formatINR(p.emi_starting_at)}/month
                </div>
              ` : ''}
              <p style="font-size: 0.9rem; color: var(--main-text); line-height: 1.6; margin-bottom: 20px;">${p.short_description || p.description?.substring(0, 150) + '...' || ''}</p>
            </div>
            <div style="display: flex; gap: 12px;">
              <button class="btn btn-primary" style="flex: 1;" onclick="Cart.add(${p.id}, null, 1, {name: '${safeName}'}); closeQuickView();">
                <i class="fa-solid fa-cart-shopping"></i> Add to Bag
              </button>
              <a href="${detailHref}" class="btn btn-outline" style="white-space: nowrap;">Full Details</a>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    modal.onclick = (e) => {
      if (e.target === modal) closeQuickView();
    };
  } catch (err) {
    showToast('Failed to load quick preview.', 'error');
  }
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  if (quickViewKeyHandler) {
    document.removeEventListener('keydown', quickViewKeyHandler);
    quickViewKeyHandler = null;
  }
}

// Global Search
function initGlobalSearch() {
  const searchInputs = document.querySelectorAll('.global-search-input');
  searchInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const inAdmin = window.location.pathname.includes('/admin');
        const target = inAdmin ? '../search.html' : 'search.html';
        window.location.href = `${target}?q=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });
}

// Mobile Menu Navigation Drawer
function initMobileNavigation() {
  const toggler = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggler && nav) {
    toggler.addEventListener('click', () => {
      nav.classList.toggle('active');
      toggler.innerHTML = nav.classList.contains('active') ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
  }
}

// Newsletter Subscription Form
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value) return;

      try {
        const res = await api.post('/inquiry/newsletter', { email: input.value.trim() });
        showToast(res.message || 'Subscribed successfully! Welcome to Nest & Nova.', 'success');
        input.value = '';
      } catch (err) {
        showToast(err.message || 'Subscription failed.', 'error');
      }
    });
  });
}

// Minimal, Refined 3-Stage Landing Entrance Animation (Plays once per session, skippable)
function initLandingAnimation() {
  const isHomepage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('.html');
  if (!isHomepage) return;

  const introOverlay = document.getElementById('landing-intro-overlay');
  if (!introOverlay) return;

  const hasSeenIntro = sessionStorage.getItem('nn_intro_seen');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasSeenIntro || prefersReducedMotion) {
    introOverlay.style.display = 'none';
    document.body.classList.remove('intro-active');
    return;
  }

  document.body.classList.add('intro-active');

  // Skip button click
  const skipBtn = document.getElementById('intro-skip-btn');
  const endIntro = () => {
    sessionStorage.setItem('nn_intro_seen', 'true');
    introOverlay.classList.add('intro-fade-out');
    document.body.classList.remove('intro-active');
    setTimeout(() => {
      introOverlay.style.display = 'none';
    }, 600);
  };

  if (skipBtn) {
    skipBtn.addEventListener('click', endIntro);
  }

  // Auto transition timeline: Stage 1 (0-1.8s) -> Stage 2 (1.8-3.5s) -> Dissolve (3.6s)
  setTimeout(() => {
    introOverlay.classList.add('stage-2-active');
  }, 1600);

  setTimeout(() => {
    endIntro();
  }, 3400);
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  Wishlist.updateBadge();
  CompareEngine.renderDrawer();
  initGlobalSearch();
  initMobileNavigation();
  initNewsletter();
  initLandingAnimation();
});

window.showToast = showToast;
window.checkAuthStatus = checkAuthStatus;
window.Wishlist = Wishlist;
window.CompareEngine = CompareEngine;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;

