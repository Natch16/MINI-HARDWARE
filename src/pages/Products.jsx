import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import BuyNowModal from '../components/BuyNowModal.jsx';
import {
  storeController,
  authController,
  filterByCategory,
  filterByPrice,
} from '../controllers/userController.js';
import AuthPromptModal from '../components/AuthPromptModal.jsx';

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [checkedCategories, setCheckedCategories] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [appliedMin, setAppliedMin] = useState(null);
  const [appliedMax, setAppliedMax] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState({ open: false, product: null });
  const [authPrompt, setAuthPrompt] = useState({ open: false, productId: null });

  useEffect(() => {
    const cats = storeController.getCategories();
    const prods = storeController.getProducts();
    setCategories(cats);
    setAllProducts(prods);

    // Pre-select category from URL param
    const catParam = searchParams.get('category');
    if (catParam) {
      setCheckedCategories([catParam]);
    }
  }, []);

  function handleBuyNow(product) {
    if (!authController.isLoggedIn()) {
      setAuthPrompt({ open: true, productId: product.id });
      return;
    }
    setModal({ open: true, product });
  }

  function toggleCategory(catId) {
    setCheckedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  }

  function applyPrice() {
    setAppliedMin(priceMin !== '' ? Number(priceMin) : null);
    setAppliedMax(priceMax !== '' ? Number(priceMax) : null);
  }

  function clearFilters() {
    setCheckedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setAppliedMin(null);
    setAppliedMax(null);
  }

  const filtered = filterByPrice(
    filterByCategory(allProducts, checkedCategories),
    appliedMin,
    appliedMax
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-forest text-white py-8 sm:py-10 md:py-12 text-center">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <h1 className="text-white" style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)' }}>Our Products</h1>
            <p className="text-white/80 mt-2 text-[0.95rem] sm:text-base">
              Browse our full catalog of hardware essentials
            </p>
          </div>
        </div>

        {/* Products Layout */}
        <section className="py-10 md:py-[60px]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] gap-5 md:gap-7 lg:gap-8 items-start">

              {/* Sidebar */}
              <aside className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden md:sticky md:top-20">
                {/* Mobile toggle */}
                <button
                  className="flex md:hidden items-center justify-between bg-forest text-white px-4 py-2.5 rounded-lg cursor-pointer font-semibold text-[0.9rem] border-0 w-full mb-0"
                  onClick={() => setSidebarOpen(prev => !prev)}
                  aria-expanded={sidebarOpen}
                >
                  <span>
                    <i className="fa-solid fa-filter mr-1.5" />
                    Filter Products
                  </span>
                  <i className={`fa-solid fa-chevron-${sidebarOpen ? 'up' : 'down'}`} />
                </button>

                {/* Sidebar inner */}
                <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block p-4 md:p-5 lg:p-6`}>
                  <h3 className="text-forest font-bold mb-4 sm:mb-5 text-[0.95rem] sm:text-base hidden md:block">
                    <i className="fa-solid fa-filter mr-1.5" />
                    Filter Products
                  </h3>

                  {/* Category filters */}
                  <div className="mb-5 sm:mb-6">
                    <h4 className="text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold mb-2.5 sm:mb-3">
                      Category
                    </h4>
                    {categories.map(cat => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 mb-2 cursor-pointer text-[0.9rem]"
                      >
                        <input
                          type="checkbox"
                          checked={checkedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="accent-green w-4 h-4"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>

                  {/* Price range */}
                  <div className="mb-5 sm:mb-6">
                    <h4 className="text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold mb-2.5 sm:mb-3">
                      Price Range (₱)
                    </h4>
                    <div className="flex gap-2 items-center flex-wrap">
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        value={priceMin}
                        onChange={e => setPriceMin(e.target.value)}
                        className="w-[72px] sm:w-20 px-2 py-1.5 border-2 border-gray-200 rounded-lg text-[0.88rem] sm:text-[0.9rem] focus:outline-none focus:border-green"
                      />
                      <span className="text-muted">–</span>
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        value={priceMax}
                        onChange={e => setPriceMax(e.target.value)}
                        className="w-[72px] sm:w-20 px-2 py-1.5 border-2 border-gray-200 rounded-lg text-[0.88rem] sm:text-[0.9rem] focus:outline-none focus:border-green"
                      />
                    </div>
                    <button
                      onClick={applyPrice}
                      className="mt-3 w-full bg-green text-white py-1.5 rounded-lg text-[0.85rem] sm:text-[0.9rem] font-semibold hover:bg-growth transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Clear filters */}
                  <button
                    onClick={clearFilters}
                    className="w-full bg-transparent border-2 border-green text-green py-1.5 rounded-lg text-[0.85rem] sm:text-[0.9rem] font-semibold hover:bg-green hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </aside>

              {/* Product Grid */}
              <div>
                <div className="flex justify-between items-center mb-5">
                  <p className="text-muted text-[0.9rem]">
                    {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                {filtered.length === 0 ? (
                  <div className="text-center py-10 sm:py-16 text-muted">
                    <div className="text-[2.5rem] sm:text-[3rem] mb-3 sm:mb-4">📦</div>
                    <p>No products match your filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {filtered.map(p => (
                      <ProductCard key={p.id} product={p} onBuyNow={handleBuyNow} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <BuyNowModal
        product={modal.product}
        open={modal.open}
        onClose={() => setModal({ open: false, product: null })}
      />
      <AuthPromptModal
        open={authPrompt.open}
        productId={authPrompt.productId}
        onClose={() => setAuthPrompt({ open: false, productId: null })}
      />
      <Footer />
    </div>
  );
}
