/**
 * home.js — Renders featured categories, featured products, and store info
 */
(function initHome() {
  // ── Categories ──────────────────────────────────────────────────────────
  const CATEGORY_ICONS = {
    'Tools': '🔧',
    'Construction Materials': '🧱',
    'Electrical Supplies': '⚡',
    'Plumbing': '🚿',
  };

  function renderCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;
    const categories = Store.getAll(Store.KEYS.CATEGORIES);
    if (categories.length === 0) {
      grid.innerHTML = '<p class="empty-state">No categories yet.</p>';
      return;
    }
    grid.innerHTML = categories.map(cat => {
      const iconHtml = cat.icon
        ? `<img src="${cat.icon}" alt="${cat.name}" style="width:56px;height:56px;object-fit:cover;border-radius:8px;margin-bottom:10px;" />`
        : `<div class="icon">${CATEGORY_ICONS[cat.name] || '📦'}</div>`;
      return `
        <a href="products.html?category=${cat.id}" class="category-card">
          ${iconHtml}
          <h3>${cat.name}</h3>
        </a>
      `;
    }).join('');
  }

  // ── Featured Products (first 4 available) ───────────────────────────────
  function renderFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;
    const products = Store.getAll(Store.KEYS.PRODUCTS).slice(0, 4);
    if (products.length === 0) {
      grid.innerHTML = '<p class="empty-state">No products yet.</p>';
      return;
    }
    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <img src="${p.image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${p.name}" loading="lazy" />
        <div class="product-card-body">
          ${p.available ? '<span class="badge-available">Available Today</span>' : ''}
          <div class="product-card-name">${p.name}</div>
          <div class="product-card-price">₱${Number(p.price).toLocaleString()}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;">
            <a href="product-detail.html?id=${p.id}" class="btn btn-sm btn-outline" style="flex:1;">Details</a>
            <button class="btn btn-sm buy-now-btn" style="flex:1;" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">Buy Now</button>
          </div>
        </div>
      </div>
    `).join('');

    // Wire Buy Now buttons
    grid.querySelectorAll('.buy-now-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof BuyNow !== 'undefined') {
          BuyNow.trigger({ id: btn.dataset.id, name: btn.dataset.name, price: Number(btn.dataset.price) });
        }
      });
    });
  }

  // ── Store Info ───────────────────────────────────────────────────────────
  function renderStoreInfo() {
    const settings = Store.getSettings();
    const addr = settings.address || '';
    const contact = settings.contactInfo || '';

    const el = document.getElementById('store-address');
    if (el) el.textContent = addr || 'Address not set';

    const el2 = document.getElementById('store-contact');
    if (el2) el2.textContent = contact || 'Contact not set';

    const fa = document.getElementById('footer-address');
    if (fa) fa.textContent = addr;

    const fc = document.getElementById('footer-contact');
    if (fc) fc.textContent = contact;
  }

  renderCategories();
  renderFeaturedProducts();
  renderStoreInfo();
})();
