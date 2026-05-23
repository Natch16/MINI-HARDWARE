import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import BuyNowModal from '../components/BuyNowModal.jsx';
import { storeController, authController } from '../controllers/userController.js';
import AuthPromptModal from '../components/AuthPromptModal.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [relatedModal, setRelatedModal] = useState({ open: false, product: null });
  const [authPrompt, setAuthPrompt] = useState(false);

  useEffect(() => {
    const products = storeController.getProducts();
    const found = products.find(p => p.id === id);
    if (!found) {
      navigate('/products');
      return;
    }
    setProduct(found);
    setMainImage(found.image || 'https://via.placeholder.com/600x400?text=No+Image');

    const categories = storeController.getCategories();
    const cat = categories.find(c => c.id === found.category);
    setCategory(cat || null);

    const related = products
      .filter(p => p.category === found.category && p.id !== found.id)
      .slice(0, 4);
    setRelatedProducts(related);
  }, [id]);

  function handleRelatedBuyNow(p) {
    if (!authController.isLoggedIn()) {
      setAuthPrompt(true);
      return;
    }
    setRelatedModal({ open: true, product: p });
  }

  if (!product) return null;

  const catName = category ? category.name : 'Uncategorized';
  const isLoggedIn = authController.isLoggedIn();
  const specs = product.specs || {};
  const previews = product.previews || [];

  const specRows = [];
  if (specs.material) specRows.push(['Material', specs.material]);
  if (specs.size)     specRows.push(['Size', specs.size]);
  if (specs.weight)   specRows.push(['Weight', specs.weight]);
  if (specs.usage)    specRows.push(['Usage', specs.usage]);
  if (specs.brand)    specRows.push(['Brand', specs.brand]);
  if (specs.warranty) specRows.push(['Warranty', specs.warranty]);
  if (specRows.length === 0) {
    specRows.push(['Category', catName]);
    specRows.push(['Availability', product.available ? 'In Stock' : 'Out of Stock']);
  }

  const settings = storeController.getSettings();
  const storeName    = settings.businessName || "JUDY'S Mini Hardware";
  const storeContact = settings.contactInfo  || 'Contact not set';
  const storeAddress = settings.address      || 'Address not set';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Product Detail */}
        <section className="py-8 pb-0">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 lg:gap-12 items-start">

              {/* LEFT: Image Gallery */}
              <div className="flex flex-col">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] max-h-[320px] sm:max-h-[400px] md:max-h-[480px] object-cover"
                />
                {previews.length > 0 && (
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    {previews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Preview ${i + 1}`}
                        onClick={() => setMainImage(src)}
                        className={`w-[72px] h-[72px] object-cover rounded-[6px] cursor-pointer border-2 transition-colors ${
                          mainImage === src ? 'border-green' : 'border-transparent hover:border-green'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Info Panel */}
              <div>
                {/* Category label */}
                <p className="text-green text-[0.85rem] font-bold uppercase tracking-[0.5px] mb-2">
                  {catName}
                </p>

                {/* Product name */}
                <h1 className="text-forest mb-2.5" style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)' }}>
                  {product.name}
                </h1>

                {/* Price */}
                <div className="text-[1.5rem] sm:text-[1.8rem] font-extrabold text-green mb-3.5 sm:mb-4">
                  ₱{Number(product.price).toLocaleString()}
                </div>

                {/* Availability badge */}
                <div className="mb-4 sm:mb-5">
                  {product.available ? (
                    <span className="inline-block bg-growth text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      ✓ Available Today
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-300 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      ✗ Out of Stock
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="border-t border-gray-200 pt-4 sm:pt-5 mb-4 sm:mb-5">
                  <h3 className="text-forest text-[0.95rem] sm:text-base font-bold mb-2.5 sm:mb-3">
                    <i className="fa-solid fa-file-lines text-green mr-1.5" />
                    Description
                  </h3>
                  <p className="text-muted leading-[1.8]">
                    {product.description || 'No description available.'}
                  </p>
                </div>

                {/* Specifications */}
                <div className="border-t border-gray-200 pt-4 sm:pt-5 mb-4 sm:mb-5">
                  <h3 className="text-forest text-[0.95rem] sm:text-base font-bold mb-2.5 sm:mb-3">
                    <i className="fa-solid fa-list-check text-green mr-1.5" />
                    Specifications
                  </h3>
                  <table className="w-full border-collapse text-[0.88rem]">
                    <tbody>
                      {specRows.map(([label, value]) => (
                        <tr key={label} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-2 pr-3 text-muted font-medium w-[38%] align-top">{label}</td>
                          <td className="py-2 text-dark font-semibold align-top">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Delivery Info */}
                <div className="bg-light rounded-lg p-3.5 sm:p-4 mb-4 sm:mb-5">
                  <h3 className="text-forest text-[0.95rem] sm:text-base font-bold mb-2.5 sm:mb-3">
                    <i className="fa-solid fa-truck text-green mr-1.5" />
                    Delivery Information
                  </h3>
                  <div className="flex items-start gap-2 bg-[#e8f5e9] border border-[#a5d6a7] rounded-[6px] p-2.5 text-[0.88rem] text-[#1b5e20] mb-2">
                    <i className="fa-solid fa-circle-check mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>FREE delivery</strong> within Barangay Pangasihan &amp; Barangay Talisay, Gingoog City, Misamis Oriental
                    </span>
                  </div>
                  <div className="flex items-start gap-2 bg-[#fff8e1] border border-[#ffe082] rounded-[6px] p-2.5 text-[0.88rem] text-[#e65100] mb-3">
                    <i className="fa-solid fa-truck mt-0.5 flex-shrink-0" />
                    <span>Delivery charges apply for other locations</span>
                  </div>
                  <p className="text-[0.8rem] text-red-700 font-semibold">
                    <i className="fa-solid fa-triangle-exclamation mr-1" />
                    No free delivery on Sundays.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 flex-wrap mb-4 sm:mb-5">
                  {isLoggedIn ? (
                    <button
                      onClick={() => setOrderModalOpen(true)}
                      className="flex-1 min-w-[140px] bg-green text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-growth transition-colors text-center"
                    >
                      <i className="fa-solid fa-cart-shopping mr-1.5" />
                      Buy Now
                    </button>
                  ) : (
                    <button
                      onClick={() => setAuthPrompt(true)}
                      className="flex-1 min-w-[140px] bg-green text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-growth transition-colors text-center"
                    >
                      <i className="fa-solid fa-cart-shopping mr-1.5" />
                      Buy Now
                    </button>
                  )}
                </div>

                {/* Store Info */}
                <div className="bg-light rounded-lg p-3.5 sm:p-4">
                  <h3 className="text-forest text-[0.95rem] sm:text-base font-bold mb-2.5 sm:mb-3">
                    <i className="fa-solid fa-store text-green mr-1.5" />
                    Store Information
                  </h3>
                  <div className="flex items-start gap-2.5 mb-2.5 text-[0.88rem] text-dark">
                    <i className="fa-solid fa-store text-base flex-shrink-0 mt-0.5" />
                    <strong>{storeName}</strong>
                  </div>
                  <div className="flex items-start gap-2.5 mb-2.5 text-[0.88rem] text-dark">
                    <i className="fa-solid fa-phone text-base flex-shrink-0 mt-0.5" />
                    <span>{storeContact}</span>
                  </div>
                  <div className="flex items-start gap-2.5 mb-2.5 text-[0.88rem] text-dark">
                    <i className="fa-solid fa-location-dot text-base flex-shrink-0 mt-0.5" />
                    <span>{storeAddress}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-[0.88rem] text-dark">
                    <i className="fa-solid fa-clock text-base flex-shrink-0 mt-0.5" />
                    <span>
                      Mon–Sat: 7:00 AM – 6:00 PM &nbsp;|&nbsp; Sun: 8:00 AM – 4:00 PM{' '}
                      <span className="text-red-700 text-[0.8rem] font-semibold">
                        (<i className="fa-solid fa-triangle-exclamation mr-0.5" />No delivery on Sundays)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-10 md:py-[60px] bg-light">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
              <h2 className="text-forest mb-2.5" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
                More from this Category
              </h2>
              <p className="text-muted mb-7 sm:mb-10 text-base sm:text-[1.05rem]">
                You might also be interested in these products
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} onBuyNow={handleRelatedBuyNow} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="bg-green text-white text-center py-9 sm:py-12 px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-white mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              Need help choosing?
            </h2>
            <p className="text-white/90 mb-5 sm:mb-6">
              Our team is ready to assist you with any hardware questions.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-green px-6 py-3 rounded-lg font-semibold hover:bg-light transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>

      {/* Buy Now Modal for main product */}
      <BuyNowModal
        product={product}
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
      />

      {/* Buy Now Modal for related products */}
      <BuyNowModal
        product={relatedModal.product}
        open={relatedModal.open}
        onClose={() => setRelatedModal({ open: false, product: null })}
      />

      {/* Auth prompt for guests */}
      <AuthPromptModal
        open={authPrompt}
        productId={product?.id}
        onClose={() => setAuthPrompt(false)}
      />

      <Footer />
    </div>
  );
}
