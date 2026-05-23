/**
 * admin/products.js — Product CRUD for admin panel
 */
(function initAdminProducts() {
  const tbody      = document.getElementById('products-tbody');
  const modal      = document.getElementById('product-modal');
  const form       = document.getElementById('product-form');
  const modalTitle = document.getElementById('modal-title');
  const catSelect  = document.getElementById('p-category');
  const availChk   = document.getElementById('p-available');
  const availLabel = document.getElementById('avail-label');

  if (!tbody) return;

  // ── Image upload helpers ──────────────────────────────────────────────────
  var pendingImageBase64 = null; // holds the newly selected image

  function showImagePreview(src) {
    var preview    = document.getElementById('p-image-preview');
    var previewImg = document.getElementById('p-image-preview-img');
    if (src) {
      previewImg.src = src;
      preview.style.display = 'block';
    } else {
      previewImg.src = '';
      preview.style.display = 'none';
    }
  }

  document.getElementById('p-image-file').addEventListener('change', function() {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      pendingImageBase64 = ev.target.result;
      document.getElementById('p-image').value = pendingImageBase64;
      showImagePreview(pendingImageBase64);
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('p-image-clear').addEventListener('click', function() {
    pendingImageBase64 = null;
    document.getElementById('p-image').value = '';
    document.getElementById('p-image-file').value = '';
    showImagePreview('');
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('visible', show);
  }

  function openModal(product) {
    // Reset image state
    pendingImageBase64 = null;
    document.getElementById('p-image-file').value = '';

    // Populate category dropdown
    const categories = Store.getAll(Store.KEYS.CATEGORIES);
    catSelect.innerHTML = '<option value="">Select category...</option>' +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (product) {
      modalTitle.textContent = 'Edit Product';
      document.getElementById('product-id').value = product.id;
      document.getElementById('p-name').value      = product.name;
      document.getElementById('p-price').value     = product.price;
      catSelect.value = product.category || '';
      document.getElementById('p-image').value     = product.image || '';
      document.getElementById('p-desc').value      = product.description || '';
      availChk.checked = !!product.available;
      showImagePreview(product.image || '');
    } else {
      modalTitle.textContent = 'Add Product';
      form.reset();
      document.getElementById('product-id').value = '';
      document.getElementById('p-image').value = '';
      showImagePreview('');
    }
    availLabel.textContent = availChk.checked ? 'Available Today' : 'Out of Stock';
    modal.classList.add('open');
  }

  function closeModal() { modal.classList.remove('open'); }

  // ── Render table ─────────────────────────────────────────────────────────
  function renderTable() {
    const products   = Store.getAll(Store.KEYS.PRODUCTS);
    const categories = Store.getAll(Store.KEYS.CATEGORIES);
    const catMap     = Object.fromEntries(categories.map(c => [c.id, c.name]));

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">No products yet. Click "+ Add Product" to get started.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td><img src="${p.image || 'https://via.placeholder.com/48?text=?'}" alt="${p.name}" /></td>
        <td><strong>${p.name}</strong></td>
        <td>${catMap[p.category] || '—'}</td>
        <td>₱${Number(p.price).toLocaleString()}</td>
        <td>${p.available ? '<span class="badge-available">Available</span>' : '<span class="badge-unavailable">Out of Stock</span>'}</td>
        <td style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn-edit" data-id="${p.id}">Edit</button>
          <button class="btn-delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    // Attach row action listeners
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = Store.getAll(Store.KEYS.PRODUCTS).find(x => x.id === btn.dataset.id);
        if (p) openModal(p);
      });
    });
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Delete this product?')) return;
        const products = Store.getAll(Store.KEYS.PRODUCTS).filter(x => x.id !== btn.dataset.id);
        Store.save(Store.KEYS.PRODUCTS, products);
        renderTable();
      });
    });
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name     = document.getElementById('p-name').value.trim();
    const price    = parseFloat(document.getElementById('p-price').value);
    const category = catSelect.value;

    let valid = true;
    showError('err-p-name',     !name);
    showError('err-p-price',    isNaN(price) || price < 0);
    showError('err-p-category', !category);
    if (!name || isNaN(price) || price < 0 || !category) valid = false;
    if (!valid) return;

    const id = document.getElementById('product-id').value;
    const product = {
      id:          id || Store.generateId(),
      name,
      price,
      category,
      image:       document.getElementById('p-image').value || '',
      description: document.getElementById('p-desc').value.trim(),
      available:   availChk.checked,
    };

    let products = Store.getAll(Store.KEYS.PRODUCTS);
    if (id) {
      products = products.map(p => p.id === id ? product : p);
    } else {
      products = [...products, product];
    }
    Store.save(Store.KEYS.PRODUCTS, products);
    closeModal();
    renderTable();
  });

  // ── Toggle label ──────────────────────────────────────────────────────────
  availChk.addEventListener('change', () => {
    availLabel.textContent = availChk.checked ? 'Available Today' : 'Out of Stock';
  });

  // ── Listeners ─────────────────────────────────────────────────────────────
  document.getElementById('btn-add-product').addEventListener('click', () => openModal(null));
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  renderTable();
})();
