/**
 * admin/categories.js — Category CRUD with icon upload and cascade delete
 */

function deleteCategory(categoryId) {
  const cats = Store.getAll(Store.KEYS.CATEGORIES).filter(c => c.id !== categoryId);
  Store.save(Store.KEYS.CATEGORIES, cats);
  // Cascade: clear category from products that used it
  const products = Store.getAll(Store.KEYS.PRODUCTS).map(p =>
    p.category === categoryId ? { ...p, category: '' } : p
  );
  Store.save(Store.KEYS.PRODUCTS, products);
}

(function initAdminCategories() {
  const tbody     = document.getElementById('categories-tbody');
  const form      = document.getElementById('category-form');
  const nameInput = document.getElementById('cat-name');
  const idInput   = document.getElementById('cat-id');
  const iconInput = document.getElementById('cat-icon');
  const formTitle = document.getElementById('cat-form-title');
  const cancelBtn = document.getElementById('cat-cancel');

  if (!tbody) return;

  // ── Icon upload handling ─────────────────────────────────────────────────
  var pendingIconBase64 = null;

  function showIconPreview(src) {
    var preview = document.getElementById('cat-icon-preview');
    var img     = document.getElementById('cat-icon-preview-img');
    if (src) {
      img.src = src;
      preview.style.display = 'flex';
    } else {
      img.src = '';
      preview.style.display = 'none';
    }
  }

  document.getElementById('cat-icon-file').addEventListener('change', function() {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      pendingIconBase64 = ev.target.result;
      iconInput.value = pendingIconBase64;
      showIconPreview(pendingIconBase64);
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('cat-icon-clear').addEventListener('click', function() {
    pendingIconBase64 = null;
    iconInput.value = '';
    document.getElementById('cat-icon-file').value = '';
    showIconPreview('');
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('visible', show);
  }

  function resetForm() {
    form.reset();
    idInput.value = '';
    iconInput.value = '';
    pendingIconBase64 = null;
    showIconPreview('');
    document.getElementById('cat-icon-file').value = '';
    formTitle.textContent = 'Add Category';
    cancelBtn.style.display = 'none';
  }

  // ── Render table ─────────────────────────────────────────────────────────
  function renderTable() {
    const categories = Store.getAll(Store.KEYS.CATEGORIES);
    const products   = Store.getAll(Store.KEYS.PRODUCTS);

    if (categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">No categories yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = categories.map(cat => {
      const count = products.filter(p => p.category === cat.id).length;
      const iconHtml = cat.icon
        ? `<img src="${cat.icon}" alt="${cat.name}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #ddd;" />`
        : `<span style="font-size:1.6rem;">📦</span>`;
      return `
        <tr>
          <td>${iconHtml}</td>
          <td><strong>${cat.name}</strong></td>
          <td>${count} product${count !== 1 ? 's' : ''}</td>
          <td style="display:flex;gap:8px;">
            <button class="btn-edit" data-id="${cat.id}">Edit</button>
            <button class="btn-delete" data-id="${cat.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = Store.getAll(Store.KEYS.CATEGORIES).find(c => c.id === btn.dataset.id);
        if (!cat) return;
        idInput.value   = cat.id;
        nameInput.value = cat.name;
        iconInput.value = cat.icon || '';
        pendingIconBase64 = cat.icon || null;
        showIconPreview(cat.icon || '');
        document.getElementById('cat-icon-file').value = '';
        formTitle.textContent = 'Edit Category';
        cancelBtn.style.display = 'inline-block';
        nameInput.focus();
      });
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Delete this category? Products in this category will become uncategorized.')) return;
        deleteCategory(btn.dataset.id);
        renderTable();
      });
    });
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    showError('err-cat-name', !name);
    if (!name) return;

    const id = idInput.value;
    const icon = iconInput.value || '';
    let categories = Store.getAll(Store.KEYS.CATEGORIES);

    if (id) {
      categories = categories.map(c => c.id === id ? { ...c, name, icon } : c);
    } else {
      categories = [...categories, { id: Store.generateId(), name, icon }];
    }

    Store.save(Store.KEYS.CATEGORIES, categories);
    resetForm();
    renderTable();
  });

  cancelBtn.addEventListener('click', resetForm);

  renderTable();
})();
