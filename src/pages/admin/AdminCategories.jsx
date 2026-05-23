import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  adminAuthController,
  categoryController,
  productController,
} from '../../controllers/adminController.js';

const EMPTY_CAT = { name: '', icon: '' };

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_CAT);
  const [pendingIconBase64, setPendingIconBase64] = useState('');
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    if (!adminAuthController.isLoggedIn()) { navigate('/admin/login'); return; }
    loadData();
  }, []);

  function loadData() {
    setCategories(categoryController.getAll());
    setProducts(productController.getAll());
  }

  function getProductCount(catId) {
    return products.filter(p => p.category === catId).length;
  }

  function handleIconFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPendingIconBase64(ev.target.result);
      setForm(f => ({ ...f, icon: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function clearIcon() {
    setPendingIconBase64('');
    setForm(f => ({ ...f, icon: '' }));
    if (fileRef.current) fileRef.current.value = '';
  }

  function startEdit(cat) {
    setEditingCategory(cat);
    setForm({ name: cat.name, icon: cat.icon || '' });
    setPendingIconBase64(cat.icon || '');
    setErrors({});
  }

  function cancelEdit() {
    setEditingCategory(null);
    setForm(EMPTY_CAT);
    setPendingIconBase64('');
    setErrors({});
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Category name is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const cat = {
      ...(editingCategory ? { id: editingCategory.id } : {}),
      name: form.name.trim(),
      icon: form.icon || '',
    };
    categoryController.save(cat);
    loadData();
    cancelEdit();
  }

  function handleDelete(id) {
    if (!confirm('Delete this category? Products in this category will have their category cleared.')) return;
    categoryController.delete(id);
    loadData();
  }

  return (
    <AdminLayout activePage="categories">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-forest text-[1.3rem] sm:text-[1.5rem] lg:text-[1.6rem] font-bold">Category Management</h1>
        <p className="text-muted text-[0.85rem] sm:text-[0.9rem] mt-1">Organize your products by managing categories.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 items-start">

        {/* LEFT: Add/Edit Form */}
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
          <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 border-b border-[#eee]">
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
          </div>
          <div className="p-4 sm:p-5">
            <form onSubmit={handleSave} noValidate>
              <div className="mb-4">
                <label className="block font-semibold text-[0.9rem] text-forest mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Tools"
                  className="w-full px-3 py-2.5 border-2 border-[#ddd] rounded-lg text-[0.95rem] focus:outline-none focus:border-green transition-colors"
                />
                {errors.name && <p className="text-[#cc0000] text-[0.8rem] mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-[0.9rem] text-forest mb-1.5">Category Icon Image (optional)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleIconFile}
                  className="w-full px-2 py-2 border-2 border-dashed border-[#ccc] rounded-lg cursor-pointer bg-[#fafafa] text-[0.9rem]"
                />
                <p className="text-[0.75rem] text-muted mt-1">Upload a JPG or PNG icon. Shown on the home page and category filters.</p>
                {pendingIconBase64 && (
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <img
                      src={pendingIconBase64}
                      alt="Icon preview"
                      className="w-14 h-14 object-cover rounded-lg border-2 border-[#ddd]"
                    />
                    <button
                      type="button"
                      onClick={clearIcon}
                      className="bg-[#fce4ec] text-[#c62828] border-0 px-3 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] font-semibold hover:bg-[#f8bbd0] transition-colors"
                    >
                      <i className="fa-solid fa-trash mr-1" /> Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 flex-wrap">
                <button
                  type="submit"
                  className="bg-green text-white border-0 px-5 py-2.5 rounded-lg cursor-pointer text-[0.9rem] font-semibold hover:bg-growth transition-colors"
                >
                  Save Category
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-[#eee] text-dark border-0 px-4 py-2.5 rounded-lg cursor-pointer text-[0.9rem] hover:bg-[#ddd] transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Categories Table */}
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
          <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 border-b border-[#eee]">
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">All Categories</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Icon</th>
                  <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Name</th>
                  <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Products</th>
                  <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted">No categories yet.</td>
                  </tr>
                ) : categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-[#fafafa]">
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle">
                      {cat.icon
                        ? <img src={cat.icon} alt={cat.name} className="w-10 h-10 object-cover rounded-lg border-2 border-[#ddd]" />
                        : <div className="w-10 h-10 bg-light rounded-lg flex items-center justify-center text-muted text-xs">—</div>
                      }
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle font-semibold">{cat.name}</td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle text-center">{getProductCount(cat.id)}</td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle whitespace-nowrap">
                      <button
                        onClick={() => startEdit(cat)}
                        className="bg-[#e3f2fd] text-[#1565c0] border-0 px-2.5 sm:px-3.5 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] sm:text-[0.82rem] font-semibold hover:bg-[#bbdefb] transition-colors whitespace-nowrap mr-1.5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="bg-[#fce4ec] text-[#c62828] border-0 px-2.5 sm:px-3.5 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] sm:text-[0.82rem] font-semibold hover:bg-[#f8bbd0] transition-colors whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
