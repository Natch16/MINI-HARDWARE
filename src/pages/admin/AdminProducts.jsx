import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import Modal from '../../components/Modal.jsx';
import {
  adminAuthController,
  productController,
  categoryController,
} from '../../controllers/adminController.js';

const EMPTY_PRODUCT = { name: '', price: '', category: '', image: '', description: '', available: true };

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [pendingImageBase64, setPendingImageBase64] = useState('');
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    if (!adminAuthController.isLoggedIn()) { navigate('/admin/login'); return; }
    loadData();
  }, []);

  function loadData() {
    setProducts(productController.getAll());
    setCategories(categoryController.getAll());
  }

  function openAdd() {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setPendingImageBase64('');
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setForm({ ...product });
    setPendingImageBase64(product.image || '');
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setPendingImageBase64('');
    setErrors({});
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleImageFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPendingImageBase64(ev.target.result);
      setForm(f => ({ ...f, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setPendingImageBase64('');
    setForm(f => ({ ...f, image: '' }));
    if (fileRef.current) fileRef.current.value = '';
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Valid price is required.';
    if (!form.category) e.category = 'Please select a category.';
    return e;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const product = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image || '',
      description: form.description || '',
      available: !!form.available,
    };
    productController.save(product);
    loadData();
    closeModal();
  }

  function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    productController.delete(id);
    loadData();
  }

  function getCategoryName(id) {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id || '—';
  }

  return (
    <AdminLayout activePage="products">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-forest text-[1.3rem] sm:text-[1.5rem] lg:text-[1.6rem] font-bold">Product Management</h1>
        <p className="text-muted text-[0.85rem] sm:text-[0.9rem] mt-1">Add, edit, or remove products from your catalog.</p>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden mb-5">
        <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 border-b border-[#eee] flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">All Products</h2>
          <button
            onClick={openAdd}
            className="bg-green text-white px-3 py-1.5 rounded-lg text-[0.82rem] sm:text-[0.9rem] font-semibold hover:bg-growth transition-colors border-0 cursor-pointer"
          >
            + Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Image</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Name</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Category</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Price</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Status</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">No products yet.</td>
                </tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-[#fafafa]">
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-[6px]" />
                      : <div className="w-10 h-10 sm:w-12 sm:h-12 bg-light rounded-[6px] flex items-center justify-center text-muted text-xs">No img</div>
                    }
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle font-semibold">{p.name}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle hidden sm:table-cell">{getCategoryName(p.category)}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle">₱{Number(p.price).toLocaleString()}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle hidden sm:table-cell">
                    {p.available
                      ? <span className="inline-block bg-[#e8f5e9] text-[#1b5e20] text-[0.75rem] font-bold px-2.5 py-0.5 rounded-xl">Available</span>
                      : <span className="inline-block bg-[#f5f5f5] text-[#555] text-[0.75rem] font-bold px-2.5 py-0.5 rounded-xl">Unavailable</span>
                    }
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle whitespace-nowrap">
                    <button
                      onClick={() => openEdit(p)}
                      className="bg-[#e3f2fd] text-[#1565c0] border-0 px-2.5 sm:px-3.5 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] sm:text-[0.82rem] font-semibold hover:bg-[#bbdefb] transition-colors whitespace-nowrap mr-1.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} noValidate>
          <div className="mb-4">
            <label className="block font-semibold text-[0.9rem] text-forest mb-1.5">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Claw Hammer"
              className="w-full px-3 py-2.5 border-2 border-[#ddd] rounded-lg text-[0.95rem] focus:outline-none focus:border-green transition-colors"
            />
            {errors.name && <p className="text-[#cc0000] text-[0.8rem] mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-[0.9rem] text-forest mb-1.5">Price (₱) *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2.5 border-2 border-[#ddd] rounded-lg text-[0.95rem] focus:outline-none focus:border-green transition-colors"
            />
            {errors.price && <p className="text-[#cc0000] text-[0.8rem] mt-1">{errors.price}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-[0.9rem] text-forest mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2.5 border-2 border-[#ddd] rounded-lg text-[0.95rem] focus:outline-none focus:border-green transition-colors bg-white"
            >
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-[#cc0000] text-[0.8rem] mt-1">{errors.category}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-[0.9rem] text-forest mb-1.5">Product Image</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleImageFile}
              className="w-full px-2 py-2 border-2 border-dashed border-[#ccc] rounded-lg cursor-pointer bg-[#fafafa] text-[0.9rem]"
            />
            {pendingImageBase64 && (
              <div className="mt-2.5 text-center">
                <img
                  src={pendingImageBase64}
                  alt="Preview"
                  className="max-w-full max-h-[160px] rounded-lg border-2 border-[#ddd] object-contain mx-auto"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="mt-1.5 bg-[#fce4ec] text-[#c62828] border-0 px-3 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] font-semibold hover:bg-[#f8bbd0] transition-colors"
                >
                  <i className="fa-solid fa-trash mr-1" /> Remove Image
                </button>
              </div>
            )}
            <p className="text-[0.75rem] text-muted mt-1">Accepts JPG, PNG, WebP. Stored as base64.</p>
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-[0.9rem] text-forest mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Product description..."
              rows={3}
              className="w-full px-3 py-2.5 border-2 border-[#ddd] rounded-lg text-[0.95rem] focus:outline-none focus:border-green transition-colors resize-y"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-[0.9rem] text-forest mb-1.5">Availability</label>
            <div className="flex items-center gap-2.5">
              <label className="relative inline-block w-11 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.available}
                  onChange={e => setForm(f => ({ ...f, available: e.target.checked }))}
                  className="opacity-0 w-0 h-0 absolute"
                />
                <span
                  className={`absolute inset-0 rounded-full transition-colors duration-200 ${form.available ? 'bg-green' : 'bg-[#ccc]'}`}
                >
                  <span
                    className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200 ${form.available ? 'translate-x-[23px]' : 'translate-x-[3px]'}`}
                  />
                </span>
              </label>
              <span className="text-[0.9rem] text-dark">{form.available ? 'Available Today' : 'Unavailable'}</span>
            </div>
          </div>

          <div className="flex gap-2.5 justify-end mt-4 flex-wrap">
            <button
              type="button"
              onClick={closeModal}
              className="bg-[#eee] text-dark border-0 px-4 py-2.5 rounded-lg cursor-pointer text-[0.9rem] hover:bg-[#ddd] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green text-white border-0 px-5 py-2.5 rounded-lg cursor-pointer text-[0.9rem] font-semibold hover:bg-growth transition-colors"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
