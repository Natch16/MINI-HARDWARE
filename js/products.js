/**
 * products.js — Filter and render products page
 */

// ── Pure filter functions (exported for property tests) ─────────────────────
function filterByCategory(products, categoryIds) {
  if (!categoryIds || categoryIds.length === 0) return products;
  return products.filter(p => categoryIds.includes(p.category));
}

function filterByPrice(products, min, max) {
  return products.filter(p => {
    const price = Number(p.price);
    const aboveMin = (min === null || min === undefined || isNaN(min)) ? true : price >= min;
    const belowMax = (max === null || max === undefined || isNaN(max)) ? true : price <= max;
    return aboveMin && belowMax;
  });
}

// ── Page init ────────────────────────────────────────────────────────────────
(function initProducts() {
  const grid          = document.getElementById('products-grid');
  const catFilters    = document.getElementById('category-filters');
  const priceMin      = document.getElementById('price-min');
  const priceMax      = document.getElementById('price-max');
  const applyPrice    = document.getElementById('apply-price');
  const clearBtn      = document.getElementById('clear-filters');
  const resultsCount  = document.getElementById('results-count');
  const footerContact = document.getElementById('footer-contact');

  if (!grid) return;

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarInner  = document.getElementById('sidebar-inner');
  const sidebarArrow  = document.getElementById('sidebar-arrow');
  if (sidebarToggle && sidebarInner) {
    sidebarToggle.addEventListener('click', () => {
      const open = sidebarInner.classList.toggle('open');
      sidebarToggle.setAttribute('aria-expanded', String(open));
      if (sidebarArrow) sidebarArrow.textContent = open ? '▲' : '▼';
    });
  }

  // Load settings into footer
  const settings = Store.getSettings();
  if (footerContact) footerContact.textContent = settings.contactInfo || '';

  // Pre-select category from URL param
  const urlParams = new URLSearchParams(window.location.search);
  const preselect = urlParams.get('category');

  // Render category checkboxes
  function renderCategoryFilters() {
    const categories = Store.getAll(Store.KEYS.CATEGORIES);
    catFilters.innerHTML = categories.map(cat => {
      const iconHtml = cat.icon
        ? `<img src="${cat.icon}" alt="" style="width:20px;height:20px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:4px;" />`
        : '';
      return `
        <label class="checkbox-label">
          <input type="checkbox" value="${cat.id}" ${preselect === cat.id ? 'checked' : ''} />
          ${iconHtml}${cat.name}
        </label>
      `;
    }).join('');
    catFilters.querySelectorAll('input').forEach(cb => cb.addEventListener('change', applyFilters));
  }

  // Render product cards
  function renderProducts(products) {
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">🔍</div>
          <p>No products match your filters.</p>
        </div>`;
      resultsCount.textContent = '0 products found';
      return;
    }
    resultsCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''} found`;
    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <img src="${p.image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${p.name}" loading="lazy" />
        <div class="product-card-body">
          ${p.available ? '<span class="badge-available">Available Today</span>' : '<span class="badge-unavailable">Out of Stock</span>'}
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
        BuyNow.trigger({ id: btn.dataset.id, name: btn.dataset.name, price: Number(btn.dataset.price) });
      });
    });
  }

  // Apply all active filters
  function applyFilters() {
    let products = Store.getAll(Store.KEYS.PRODUCTS);

    // Category filter
    const checked = Array.from(catFilters.querySelectorAll('input:checked')).map(cb => cb.value);
    products = filterByCategory(products, checked);

    // Price filter
    const min = priceMin.value !== '' ? Number(priceMin.value) : null;
    const max = priceMax.value !== '' ? Number(priceMax.value) : null;
    products = filterByPrice(products, min, max);

    renderProducts(products);
  }

  applyPrice.addEventListener('click', applyFilters);
  clearBtn.addEventListener('click', () => {
    catFilters.querySelectorAll('input').forEach(cb => cb.checked = false);
    priceMin.value = '';
    priceMax.value = '';
    applyFilters();
  });

  renderCategoryFilters();
  applyFilters();
})();
