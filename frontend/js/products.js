/**
 * NEST & NOVA 2.0 — Products Catalog, Spec Engine & Indian Detail View
 */

const formatINR = (typeof window !== 'undefined' && window.formatINR) ? window.formatINR : function(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
};

const productImageMap = {
  1: 'assets/images/headphone.jpg',
  2: 'assets/images/smartphone.jpg',
  3: 'assets/images/laptop.jpg',
  4: 'assets/images/tv.jpg',
  5: 'assets/images/camera.jpg',
  6: 'assets/images/smartwatch.jpg',
  7: 'assets/images/speaker.jpg',
  8: 'assets/images/controller.jpg',
  9: 'assets/images/charger.jpg',
  10: 'assets/images/sofa.jpg',
  11: 'assets/images/bed.jpg',
  12: 'assets/images/chairtask.jpg',
  13: 'assets/images/diningtable.jpg',
  14: 'assets/images/wardrobe.jpg',
  15: 'assets/images/desk.jpg',
  16: 'assets/images/lamp.jpg',
  17: 'assets/images/credenza.jpg',
  18: 'assets/images/vase.jpg',
  19: 'assets/images/laptopzenith.jpg',
  20: 'assets/images/coffe table.jpg',
  21: 'assets/images/earbuds.jpg',
  22: 'assets/images/chair dining.jpg'
};

const categorySvgFallbackMap = {
  1: 'assets/images/smartphone.svg',
  2: 'assets/images/laptop.svg',
  3: 'assets/images/headphones.svg',
  4: 'assets/images/tv.svg',
  5: 'assets/images/camera.svg',
  6: 'assets/images/smartwatch.svg',
  7: 'assets/images/speaker.svg',
  8: 'assets/images/controller.svg',
  9: 'assets/images/charger.svg',
  10: 'assets/images/sofa.svg',
  11: 'assets/images/bed.svg',
  12: 'assets/images/chair.svg',
  13: 'assets/images/dining-table.svg',
  14: 'assets/images/wardrobe.svg',
  15: 'assets/images/desk.svg',
  16: 'assets/images/lamp.svg',
  17: 'assets/images/credenza.svg',
  18: 'assets/images/vase.svg'
};

const ProductsEngine = {
  resolveImage(url, catId, productId) {
    if (productId && productImageMap[productId]) {
      if (!url || url.endsWith('.svg') || url.includes('placeholder')) {
        const pImg = productImageMap[productId];
        return typeof window.getAssetPath === 'function' ? window.getAssetPath(pImg) : pImg;
      }
    }
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
      return url;
    }
    if (url && url.length > 5 && !url.includes('undefined')) {
      return typeof window.getAssetPath === 'function' ? window.getAssetPath(url) : url;
    }
    if (productId && productImageMap[productId]) {
      const pImg = productImageMap[productId];
      return typeof window.getAssetPath === 'function' ? window.getAssetPath(pImg) : pImg;
    }
    const fallback = categorySvgFallbackMap[catId] || 'assets/images/hero-lifestyle.svg';
    return typeof window.getAssetPath === 'function' ? window.getAssetPath(fallback) : fallback;
  },

  getFallbackSvg(catId, productId) {
    const fallback = categorySvgFallbackMap[catId] || 'assets/images/hero-lifestyle.svg';
    return typeof window.getAssetPath === 'function' ? window.getAssetPath(fallback) : fallback;
  },

  // Render single product card HTML with Indian Currency & Compare
  renderCard(p) {
    const isWishlisted = typeof Wishlist !== 'undefined' && Wishlist.has(p.id);
    const isCompared = typeof CompareEngine !== 'undefined' && CompareEngine.has(p.id);

    const stockStatus = p.stock_quantity > 5 
      ? '<span class="card-stock-status"><i class="fa-solid fa-circle-check"></i> In Stock</span>' 
      : (p.stock_quantity > 0 
        ? `<span class="card-stock-status low-stock"><i class="fa-solid fa-clock"></i> Only ${p.stock_quantity} left</span>` 
        : '<span class="card-stock-status out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Sold Out</span>');

    const fallbackImg = this.getFallbackSvg(p.category_id, p.id);
    const rawImg = p.primary_image || (p.images && p.images[0]?.image_url);
    const imageSrc = this.resolveImage(rawImg, p.category_id, p.id);
    const detailLink = (typeof window.getAssetPath === 'function' && window.location.pathname.includes('/admin')) 
      ? `../product.html?id=${p.id}` 
      : `product.html?id=${p.id}`;

    const attrSafeName = (p.name || '').replace(/"/g, '&quot;');
    const jsSafeName = (p.name || '').replace(/\\/g, '\\\\').replace(/['"]/g, '');
    const isElectronics = p.department === 'electronics';

    return `
      <div class="product-card" data-product-id="${p.id}">
        <div class="card-media-wrapper">
          <img src="${imageSrc}" alt="${attrSafeName}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
          
          <div class="card-badges">
            ${p.discount_percent > 0 ? `<span class="card-badge badge-discount">-${p.discount_percent}%</span>` : ''}
            <span class="card-badge badge-department">${p.department || 'Curated'}</span>
          </div>

          <button class="card-action-wishlist ${isWishlisted ? 'active' : ''}" 
            title="Save to Wishlist" 
            onclick="event.stopPropagation(); const isSaved = Wishlist.toggle(${p.id}, '${jsSafeName}'); this.classList.toggle('active', isSaved); const ico = this.querySelector('i'); if (ico) { ico.className = isSaved ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; }">
            <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
          </button>

          <button class="card-quick-view-btn" onclick="event.stopPropagation(); openQuickView(${p.id})">
            <i class="fa-solid fa-eye"></i> Quick View
          </button>
        </div>

        <div class="card-body">
          <div class="card-brand">${p.brand_name || 'Nest & Nova'}</div>
          <a href="${detailLink}" class="card-title" title="${attrSafeName}">${p.name}</a>

          <div class="card-rating-wrap">
            <span class="star-icons">
              <i class="fa-solid fa-star"></i>
            </span>
            <strong>${Number(p.rating || 4.9).toFixed(1)}</strong>
            <span>(${p.review_count || 48})</span>
          </div>

          ${stockStatus}

          <div class="card-price-row">
            <span class="current-price">${formatINR(p.price)}</span>
            ${p.original_price ? `<span class="original-price">${formatINR(p.original_price)}</span>` : ''}
          </div>

          ${p.emi_starting_at ? `
            <div style="font-size: 0.76rem; color: var(--dark-sage); font-weight: 600; margin-bottom: 12px;">
              EMI from ${formatINR(p.emi_starting_at)}/mo
            </div>
          ` : ''}

          <div style="display: flex; gap: 8px;">
            <button class="card-btn-cart" style="flex: 1;" onclick="ProductsEngine.handleAddToCart(this, ${p.id}, '${jsSafeName}')">
              <i class="fa-solid fa-cart-shopping"></i> Add to Bag
            </button>
            ${isElectronics ? `
              <button class="card-btn-compare ${isCompared ? 'active' : ''}" 
                title="Compare specs with other electronics" 
                onclick="event.stopPropagation(); this.classList.toggle('active', CompareEngine.toggle(${p.id}, '${jsSafeName}'));">
                <i class="fa-solid fa-code-compare"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  async handleAddToCart(button, productId, productName) {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Adding...';

    try {
      if (typeof Cart !== 'undefined') {
        await Cart.add(productId, null, 1, { name: productName });
      }
      button.innerHTML = '<i class="fa-solid fa-check"></i> Added';
      button.style.backgroundColor = 'var(--dark-sage)';
      button.style.color = 'var(--pure-white)';

      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
      }, 1400);
    } catch (e) {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  },

  // Load Catalog Page with sidebar filters
  async loadCatalog({ department, targetElementId = 'catalog-products-grid' }) {
    const grid = document.getElementById(targetElementId);
    if (!grid) return;

    // Only show skeletons if grid is currently empty
    if (!grid.children || grid.children.length === 0) {
      grid.innerHTML = Array(6).fill(0).map(() => `
        <div class="product-card skeleton" style="height: 380px;"></div>
      `).join('');
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category');
      const sortParam = document.getElementById('catalog-sort-select')?.value || urlParams.get('sort') || 'newest';
      const searchParam = urlParams.get('search') || urlParams.get('q');
      
      const checkedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(cb => cb.value);
      const brandParam = checkedBrands.length > 0 ? checkedBrands[0] : (urlParams.get('brand') || '');
      
      const minPrice = document.getElementById('filter-min-price')?.value;
      const maxPrice = document.getElementById('filter-max-price')?.value;

      const params = {
        department: department || '',
        category: categoryParam || '',
        sort: sortParam,
        brand: brandParam || '',
        search: searchParam || '',
        min_price: minPrice || '',
        max_price: maxPrice || '',
        limit: 24
      };

      let products = [];
      try {
        const res = await api.get('/products', params);
        products = res.data || [];
      } catch (e) {
        // Safe internal fallback
        if (typeof window !== 'undefined' && window.NEST_NOVA_DATA && window.NEST_NOVA_DATA.products) {
          let list = window.NEST_NOVA_DATA.products;
          if (department) list = list.filter(p => p.department === department);
          if (categoryParam) {
            const s = categoryParam.toLowerCase().replace(/[^a-z0-9]/g, '');
            list = list.filter(p => (p.category_name && p.category_name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(s)));
          }
          if (brandParam) list = list.filter(p => p.brand_name && p.brand_name.toLowerCase() === brandParam.toLowerCase());
          if (minPrice) list = list.filter(p => p.price >= parseFloat(minPrice));
          if (maxPrice) list = list.filter(p => p.price <= parseFloat(maxPrice));
          products = list;
        }
      }

      const countEl = document.getElementById('catalog-product-count');
      if (countEl) countEl.textContent = `${products.length} Products Found`;

      if (products.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon"><i class="fa-solid fa-sliders"></i></div>
            <h2 class="empty-state-title">No matching pieces found</h2>
            <p class="empty-state-desc">Try clearing selected filters or exploring different categories.</p>
            <button class="btn btn-outline-sage" onclick="window.location.search = ''">Clear All Filters</button>
          </div>
        `;
        return;
      }

      grid.innerHTML = products.map(p => this.renderCard(p)).join('');
    } catch (err) {
      console.warn('loadCatalog fallback error:', err);
    }
  },

  // Load Reusable Product Details Page
  async loadProductDetails() {
    const container = document.getElementById('product-detail-view');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || urlParams.get('slug') || 1;

    try {
      const res = await api.get(`/products/${productId}`);
      const p = res.data;

      document.title = `${p.name} — NEST & NOVA`;

      const fallbackImg = this.getFallbackSvg(p.category_id, p.id);
      const galleryImages = (p.images && p.images.length > 0) 
        ? p.images.map(img => ({ image_url: this.resolveImage(img.image_url, p.category_id, p.id), alt_text: img.alt_text || p.name }))
        : [{ image_url: this.resolveImage(p.primary_image, p.category_id, p.id), alt_text: p.name }];

      const thumbnailsHtml = galleryImages.map((img, idx) => `
        <button class="thumbnail-btn ${idx === 0 ? 'active' : ''}" onclick="ProductsEngine.switchMainImage('${img.image_url}', this)">
          <img src="${img.image_url}" alt="${img.alt_text}" onerror="this.onerror=null; this.src='${fallbackImg}';">
        </button>
      `).join('');

      const variantsHtml = p.variants && p.variants.length > 0 ? `
        <div class="variant-selector-wrap" style="margin: 20px 0;">
          <label class="form-label" style="font-weight: 600; color: var(--walnut-brown); display: block; margin-bottom: 8px;">Select Variant / Option:</label>
          <div class="variant-options" style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${p.variants.map((v, idx) => `
              <button class="variant-btn ${idx === 0 ? 'active' : ''}" 
                onclick="ProductsEngine.selectVariant(${v.id}, ${v.additional_price}, '${v.variant_name}', this)"
                style="padding: 8px 16px; border: 1px solid var(--border-color); background: ${idx === 0 ? 'var(--dark-sage)' : 'var(--pure-white)'}; color: ${idx === 0 ? 'var(--pure-white)' : 'var(--main-text)'}; border-radius: var(--radius-sm); font-size: 0.88rem; cursor: pointer;">
                ${v.variant_name} ${v.additional_price > 0 ? `(+${formatINR(v.additional_price)})` : ''}
              </button>
            `).join('')}
          </div>
        </div>
      ` : '';

      const isElectronics = p.department === 'electronics';

      // Specifications rows
      const specsObj = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {});
      const specsRows = Object.entries(specsObj).map(([key, val]) => `
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; color: var(--walnut-brown); width: 35%; border-bottom: 1px solid var(--border-color); background: #FAF9F5;">${key}</td>
          <td style="padding: 10px 14px; color: var(--main-text); border-bottom: 1px solid var(--border-color);">${val}</td>
        </tr>
      `).join('');

      // Dimensions rows
      const dimsObj = typeof p.dimensions === 'string' ? JSON.parse(p.dimensions) : (p.dimensions || {});
      const dimsRows = Object.entries(dimsObj).map(([key, val]) => `
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; color: var(--walnut-brown); width: 35%; border-bottom: 1px solid var(--border-color); background: #FAF9F5;">${key}</td>
          <td style="padding: 10px 14px; color: var(--main-text); border-bottom: 1px solid var(--border-color);">${val}</td>
        </tr>
      `).join('');

      const relatedHtml = p.related && p.related.length > 0 
        ? p.related.map(r => this.renderCard(r)).join('')
        : '<p style="color: var(--muted-text);">Explore our complete collection for matching pieces.</p>';

      const reviewsHtml = (p.reviews && p.reviews.length > 0)
        ? p.reviews.map(r => `
          <div class="review-card" style="margin-bottom: 16px; padding: 18px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--pure-white);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="star-icons" style="color: #C29D59;">
                ${Array(r.rating || 5).fill('<i class="fa-solid fa-star"></i>').join('')}
              </span>
              <span style="font-size: 0.78rem; color: var(--muted-text);"><i class="fa-solid fa-circle-check" style="color: var(--success-color);"></i> Verified Indian Buyer</span>
            </div>
            <h4 style="font-size: 1.05rem; color: var(--walnut-brown); margin-bottom: 6px;">${r.title}</h4>
            <p style="font-size: 0.92rem; color: var(--main-text); line-height: 1.6; margin-bottom: 12px;">${r.comment}</p>
            <div style="font-size: 0.8rem; color: var(--muted-text); font-weight: 600;">— ${r.user_name}</div>
          </div>
        `).join('')
        : '<p style="color: var(--muted-text); font-style: italic; margin-bottom: 24px;">Be the first to review this piece.</p>';

      const safeName = p.name.replace(/'/g, "\\'");

      container.innerHTML = `
        <div class="catalog-breadcrumb" style="margin-bottom: 24px; font-size: 0.88rem; color: var(--muted-text);">
          <a href="index.html" style="color: var(--muted-text);">Home</a> <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; margin: 0 6px;"></i>
          <a href="${p.department}.html" style="color: var(--muted-text); text-transform: uppercase;">${p.department}</a> <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; margin: 0 6px;"></i>
          <span>${p.category_name}</span> <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; margin: 0 6px;"></i>
          <strong style="color: var(--walnut-brown);">${p.name}</strong>
        </div>

        <div class="product-detail-layout">
          <!-- Left: Gallery -->
          <div>
            <div class="main-gallery-view" style="border-radius: var(--radius-md); overflow: hidden; height: 500px; background: var(--warm-cream); position: relative; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;">
              <img id="main-product-image" src="${galleryImages[0].image_url}" alt="${p.name}" style="max-width: 90%; max-height: 90%; object-fit: contain; transition: transform 0.3s ease;" onerror="this.onerror=null; this.src='${fallbackImg}';">
              <button class="image-zoom-trigger" title="Zoom In" onclick="ProductsEngine.zoomMainImage()" style="position: absolute; bottom: 16px; right: 16px; background: rgba(255,255,255,0.9); width: 40px; height: 40px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-subtle);">
                <i class="fa-solid fa-magnifying-glass-plus"></i>
              </button>
            </div>
            
            ${galleryImages.length > 1 ? `
              <div class="gallery-thumbnails" style="display: flex; gap: 12px; margin-top: 16px;">
                ${thumbnailsHtml}
              </div>
            ` : ''}
          </div>

          <!-- Right: Purchase & Spec Details -->
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--primary-sage); font-weight: 700; margin-bottom: 8px;">
              ${p.brand_name || 'Nest & Nova'} &bull; ${p.category_name}
            </div>

            <h1 style="font-size: 2.3rem; color: var(--walnut-brown); line-height: 1.2; margin-bottom: 12px;">${p.name}</h1>

            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
              <div class="card-rating-wrap" style="display: flex; align-items: center; gap: 6px;">
                <span class="star-icons" style="color: #C29D59;"><i class="fa-solid fa-star"></i></span>
                <strong>${Number(p.rating || 4.9).toFixed(1)}</strong>
                <span style="color: var(--muted-text);">(${p.review_count || 48} verified ratings)</span>
              </div>
              <span style="color: var(--border-color);">|</span>
              <span style="font-size: 0.85rem; color: var(--success-color); font-weight: 600;">
                <i class="fa-solid fa-circle-check"></i> In Stock (${p.stock_quantity || 24} units ready to dispatch)
              </span>
            </div>

            <div style="display: flex; align-items: baseline; gap: 16px; margin-bottom: 12px;">
              <span id="detail-current-price" style="font-size: 2.2rem; font-weight: 700; color: var(--walnut-brown);">${formatINR(p.price)}</span>
              ${p.original_price ? `<span style="font-size: 1.3rem; text-decoration: line-through; color: var(--muted-text);">${formatINR(p.original_price)}</span>` : ''}
              ${p.discount_percent > 0 ? `<span class="card-badge badge-discount">Save ${p.discount_percent}%</span>` : ''}
            </div>

            <!-- Indian EMI Offer Banner -->
            ${p.emi_starting_at ? `
              <div style="background: #F3F6F1; border: 1px solid rgba(135,151,128,0.4); padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: 20px; font-size: 0.88rem; color: var(--dark-sage); display: flex; justify-content: space-between; align-items: center;">
                <span><i class="fa-solid fa-credit-card"></i> <strong>No Cost EMI:</strong> Avail from <strong>${formatINR(p.emi_starting_at)}/month</strong> on major Indian credit cards &amp; Bajaj Finserv</span>
                <span style="font-size: 0.8rem; font-weight: 700; cursor: pointer; text-decoration: underline;" onclick="showToast('No-Cost EMI plans available for 3, 6, 9 and 12 months at checkout.', 'info')">View Plans</span>
              </div>
            ` : ''}

            <p style="font-size: 1rem; color: var(--main-text); line-height: 1.7; margin-bottom: 20px;">
              ${p.short_description || p.description}
            </p>

            ${variantsHtml}

            <!-- Quantity & Actions -->
            <div style="display: flex; gap: 16px; align-items: center; margin: 28px 0;">
              <div class="qty-counter" style="display: inline-flex; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--warm-cream);">
                <button class="qty-btn" onclick="ProductsEngine.changeDetailQty(-1)" style="padding: 10px 16px; cursor: pointer; background: transparent; font-size: 1.1rem;">-</button>
                <span id="detail-qty-display" style="padding: 10px 16px; font-weight: 700;">1</span>
                <button class="qty-btn" onclick="ProductsEngine.changeDetailQty(1)" style="padding: 10px 16px; cursor: pointer; background: transparent; font-size: 1.1rem;">+</button>
              </div>

              <button class="btn btn-primary btn-lg" style="flex: 1;" onclick="ProductsEngine.addDetailToCart(${p.id}, '${safeName}')">
                <i class="fa-solid fa-cart-shopping"></i> Add to Bag
              </button>

              <button class="btn btn-outline-sage btn-lg" onclick="Wishlist.toggle(${p.id}, '${safeName}')" title="Save to Wishlist">
                <i class="fa-regular fa-heart"></i>
              </button>

              ${isElectronics ? `
                <button class="btn btn-outline btn-lg" onclick="CompareEngine.toggle(${p.id}, '${safeName}')" title="Compare specifications">
                  <i class="fa-solid fa-code-compare"></i> Compare
                </button>
              ` : ''}
            </div>

            <!-- Indian PIN Code Serviceability Checker -->
            <div style="background: var(--light-sage); padding: 18px 20px; border-radius: var(--radius-md); margin-bottom: 28px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <i class="fa-solid fa-truck-fast" style="color: var(--dark-sage); font-size: 1.2rem;"></i>
                <strong style="color: var(--walnut-brown); font-size: 0.95rem;">Delivery &amp; Serviceability Check</strong>
              </div>
              <p style="font-size: 0.85rem; color: var(--muted-text); margin-bottom: 12px;">Enter your 6-digit Indian PIN Code to check courier speed, installation, &amp; Cash on Delivery eligibility:</p>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="postcode-input" class="form-control" maxlength="6" placeholder="e.g. 560001" style="max-width: 160px; padding: 10px 14px; background: var(--pure-white); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-weight: 600;">
                <button class="btn btn-secondary btn-sm" onclick="ProductsEngine.checkDeliveryPostcode()">Check PIN</button>
              </div>
              <div id="postcode-result" style="font-size: 0.85rem; margin-top: 10px; font-weight: 600;"></div>
            </div>

            <!-- Trust Badges -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem; color: var(--muted-text);">
              <div><i class="fa-solid fa-shield-halved" style="color: var(--primary-sage);"></i> ${p.warranty_info || '1-Year Indian Warranty'}</div>
              <div><i class="fa-solid fa-arrow-rotate-left" style="color: var(--primary-sage);"></i> ${p.return_policy || '7-Day Replacement'}</div>
              <div><i class="fa-solid fa-indian-rupee-sign" style="color: var(--primary-sage);"></i> Cash on Delivery Available</div>
              <div><i class="fa-solid fa-award" style="color: var(--primary-sage);"></i> 100% Genuine Certified</div>
            </div>
          </div>
        </div>

        <!-- Specifications & Extended Content Tabs -->
        <div class="product-tabs-section" style="margin-bottom: 64px; border-top: 1px solid var(--border-color); padding-top: 48px;">
          <h2 style="font-size: 1.8rem; margin-bottom: 24px; color: var(--walnut-brown);">
            ${isElectronics ? 'Technical Specifications & Hardware Details' : 'Architectural Specs, Materials & Dimensions'}
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
            <div style="background: var(--warm-cream); border-radius: var(--radius-md); padding: 24px; border: 1px solid var(--border-color);">
              <h3 style="font-size: 1.15rem; color: var(--walnut-brown); margin-bottom: 16px;">
                <i class="fa-solid ${isElectronics ? 'fa-microchip' : 'fa-couch'}"></i> 
                ${isElectronics ? 'Processing & Performance Specs' : 'Craftsmanship & Materials'}
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <tbody>${specsRows}</tbody>
              </table>
            </div>

            <div style="background: var(--warm-cream); border-radius: var(--radius-md); padding: 24px; border: 1px solid var(--border-color);">
              <h3 style="font-size: 1.15rem; color: var(--walnut-brown); margin-bottom: 16px;">
                <i class="fa-solid fa-ruler-combined"></i> Dimensions &amp; Logistics
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <tbody>
                  ${dimsRows}
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 600; color: var(--walnut-brown); width: 35%; border-bottom: 1px solid var(--border-color); background: #FAF9F5;">Assembly</td>
                    <td style="padding: 10px 14px; color: var(--main-text); border-bottom: 1px solid var(--border-color);">${p.assembly_required || 'Fully Assembled / Plug & Play'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div style="margin-bottom: 64px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="font-size: 1.8rem; color: var(--walnut-brown); margin: 0;">Verified Indian Buyer Reviews</h2>
            <button class="btn btn-outline-sage" onclick="showToast('Review submissions are active for verified purchasers.', 'info')">Write a Review</button>
          </div>
          <div>${reviewsHtml}</div>
        </div>

        <!-- Related Pieces -->
        <div>
          <h2 style="font-size: 1.8rem; color: var(--walnut-brown); margin-bottom: 24px;">Recommended for You</h2>
          <div class="product-grid">${relatedHtml}</div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="empty-state">
          <p style="color: var(--error-color);">Unable to load product: ${err.message}</p>
        </div>
      `;
    }
  },

  switchMainImage(src, btn) {
    const mainImg = document.getElementById('main-product-image');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.thumbnail-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  zoomMainImage() {
    const mainImg = document.getElementById('main-product-image');
    if (!mainImg) return;
    const isZoomed = mainImg.style.transform === 'scale(1.4)';
    mainImg.style.transform = isZoomed ? 'scale(1)' : 'scale(1.4)';
  },

  changeDetailQty(delta) {
    const display = document.getElementById('detail-qty-display');
    if (!display) return;
    let qty = parseInt(display.textContent, 10) + delta;
    if (qty < 1) qty = 1;
    display.textContent = qty;
  },

  selectVariant(id, additionalPrice, name, btn) {
    this.selectedVariantId = id;
    document.querySelectorAll('.variant-btn').forEach(b => {
      b.style.background = 'var(--pure-white)';
      b.style.color = 'var(--main-text)';
    });
    if (btn) {
      btn.style.background = 'var(--dark-sage)';
      btn.style.color = 'var(--pure-white)';
    }
  },

  addDetailToCart(productId, productName) {
    const qty = parseInt(document.getElementById('detail-qty-display')?.textContent || '1', 10);
    if (typeof Cart !== 'undefined') {
      Cart.add(productId, this.selectedVariantId || null, qty, { name: productName });
    }
  },

  async checkDeliveryPostcode() {
    const input = document.getElementById('postcode-input');
    const result = document.getElementById('postcode-result');
    if (!input || !result) return;
    const code = input.value.trim();

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      result.innerHTML = `<span style="color: var(--error-color);"><i class="fa-solid fa-triangle-exclamation"></i> Please enter a valid 6-digit Indian PIN code.</span>`;
      return;
    }

    try {
      const res = await api.get('/pincode/check', { code });
      if (res.serviceable) {
        result.innerHTML = `
          <div style="color: var(--success-color); line-height: 1.5;">
            <i class="fa-solid fa-circle-check"></i> <strong>Serviceable!</strong> ${res.message}<br>
            <span style="font-size: 0.8rem; color: var(--muted-text);">
              &bull; Free White-Glove In-Home Delivery &bull; ${res.cod_available ? 'Cash on Delivery Eligible' : 'Prepaid Only'}
            </span>
          </div>
        `;
      } else {
        result.innerHTML = `<span style="color: var(--error-color);">${res.message}</span>`;
      }
    } catch (e) {
      result.innerHTML = `<span style="color: var(--success-color);"><i class="fa-solid fa-circle-check"></i> Standard Delivery available in 3-5 days to PIN ${code}.</span>`;
    }
  }
};

window.ProductsEngine = ProductsEngine;

