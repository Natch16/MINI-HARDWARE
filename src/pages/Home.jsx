import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import BuyNowModal from '../components/BuyNowModal.jsx';
import { storeController, authController } from '../controllers/userController.js';
import AuthPromptModal from '../components/AuthPromptModal.jsx';

const CATEGORY_ICONS = {
  'Tools': '🔧',
  'Construction Materials': '🧱',
  'Electrical Supplies': '⚡',
  'Plumbing': '🚿',
};

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [modal, setModal] = useState({ open: false, product: null });
  const [authPrompt, setAuthPrompt] = useState({ open: false, productId: null });

  useEffect(() => {
    setCategories(storeController.getCategories());
    setProducts(storeController.getProducts().slice(0, 4));
    setSettings(storeController.getSettings());
  }, []);

  function handleBuyNow(product) {
    if (!authController.isLoggedIn()) {
      setAuthPrompt({ open: true, productId: product.id });
      return;
    }
    setModal({ open: true, product });
  }

  const address = settings.address || 'P-7 Pangasihan, Gingoog City, Misamis Oriental';
  const contact = settings.contactInfo || '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative min-h-[340px] sm:min-h-[420px] md:min-h-[520px] flex items-center bg-forest overflow-hidden py-10 md:py-[60px]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1400&q=80')" }}
          />
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 w-full">
            <div className="text-white max-w-[600px]">
              <h1 className="text-white mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)' }}>
                Your Trusted Local Hardware Store
              </h1>
              <p className="text-white/85 text-base sm:text-[1.1rem] md:text-[1.15rem] mb-6 sm:mb-7 md:mb-8">
                Quality tools, construction materials, electrical supplies, and plumbing essentials — delivered to your door.
              </p>
              <div>
                <Link
                  to="/products"
                  className="inline-block bg-green text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-growth transition-colors shadow-[0_0_16px_rgba(56,176,0,0.45)] hover:-translate-y-px"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>

         {/* Delivery Banner */}
        <div className="bg-green text-white text-center py-2.5 sm:py-3 px-4 text-[0.82rem] sm:text-[0.88rem] md:text-[0.92rem] font-semibold">
          <i className="fa-solid fa-truck mr-1.5" />Free delivery to Barangay Talisay &amp; Pangasihan | ₱80 delivery fee for other areas
        </div>

        {/* Categories Section */}
        <section className="py-10 md:py-[60px]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-forest mb-2.5 sm:mb-3" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              Browse by Category
            </h2>
            <p className="text-muted mb-7 sm:mb-10 text-base sm:text-[1.05rem]">
              Find exactly what you need
            </p>
            {categories.length === 0 ? (
              <p className="text-center text-muted py-10">No categories yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.id}`}
                    className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] p-6 sm:p-8 text-center cursor-pointer border-2 border-transparent hover:shadow-[0_0_0_3px_#38B000,0_6px_24px_rgba(0,75,35,0.18)] hover:border-growth hover:-translate-y-1 transition-all duration-300 block"
                  >
                    {cat.icon ? (
                      <img
                        src={cat.icon}
                        alt={cat.name}
                        className="w-14 h-14 object-cover rounded-lg mb-2.5 mx-auto"
                      />
                    ) : (
                      <div className="text-[2rem] sm:text-[2.5rem] mb-2.5 sm:mb-3">
                        {CATEGORY_ICONS[cat.name] || '📦'}
                      </div>
                    )}
                    <h3 className="text-forest text-[0.9rem] sm:text-base font-bold">{cat.name}</h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-10 md:py-[60px] bg-light">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-forest mb-2.5 sm:mb-3" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              Featured Products
            </h2>
            <p className="text-muted mb-7 sm:mb-10 text-base sm:text-[1.05rem]">
              Top picks from our catalog
            </p>
            {products.length === 0 ? (
              <p className="text-center text-muted py-10">No products yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onBuyNow={handleBuyNow} />
                ))}
              </div>
            )}
          </div>
        </section>


        {/* Store Info Section */}
        <section className="py-10 md:py-[60px]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-forest mb-2.5 sm:mb-3" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              Visit Our Store
            </h2>
            <p className="text-muted mb-7 sm:mb-10 text-base sm:text-[1.05rem]">
              Come see us in person
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 items-start">
              {/* Store info items — matches reference image design */}
              <div className="text-left">

                {/* Store Address */}
                <div className="flex gap-4 items-start mb-6">
                  <span className="text-green text-[1.6rem] flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-location-dot" />
                  </span>
                  <div>
                    <p className="font-bold text-dark text-[0.95rem] sm:text-base mb-0.5">Store Address</p>
                    <p className="text-muted text-[0.9rem] sm:text-[0.95rem]">{address}</p>
                  </div>
                </div>

                {/* Contact Number */}
                <div className="flex gap-4 items-start mb-6">
                  <span className="text-green text-[1.6rem] flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-phone" />
                  </span>
                  <div>
                    <p className="font-bold text-dark text-[0.95rem] sm:text-base mb-0.5">Contact Number</p>
                    <p className="text-muted text-[0.9rem] sm:text-[0.95rem]">
                      {contact || '(Contact number to be provided)'}
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex gap-4 items-start mb-6">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green text-white flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-clock text-[1rem]" />
                  </span>
                  <div>
                    <p className="font-bold text-dark text-[0.95rem] sm:text-base mb-0.5">Business Hours</p>
                    <p className="text-muted text-[0.9rem] sm:text-[0.95rem]">Monday – Saturday: 7:00 AM – 6:00 PM</p>
                    <p className="text-muted text-[0.9rem] sm:text-[0.95rem]">
                      Sunday: 8:00 AM – 4:00 PM{' '}
                      <span className="text-[#c62828] font-semibold">(No delivery on Sundays)</span>
                    </p>
                  </div>
                </div>

                {/* Free Delivery Areas */}
                <div className="flex gap-4 items-start">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green text-white flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-truck text-[1rem]" />
                  </span>
                  <div>
                    <p className="font-bold text-dark text-[0.95rem] sm:text-base mb-0.5">Free Delivery Areas</p>
                    <p className="text-muted text-[0.9rem] sm:text-[0.95rem]">
                      Barangay Talisay &amp; Barangay Pangasihan, Gingoog City
                    </p>
                    <p className="text-muted text-[0.82rem] mt-1">₱80 delivery fee for other locations</p>
                    <p className="text-[#c62828] text-[0.82rem] font-semibold mt-1">
                      <i className="fa-solid fa-triangle-exclamation mr-1" />
                      No free delivery on Sundays.
                    </p>
                  </div>
                </div>

              </div>
              

              {/* Map */}
              <div className="rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.10)]">
                <iframe
                  title="JUDY'S Mini Hardware Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.0!2d124.9!3d8.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPangasihan%2C+Gingoog+City%2C+Misamis+Oriental!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                  width="100%"
                  height="260"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="bg-forest text-white px-3.5 py-2.5 text-[0.82rem] flex items-center gap-2 flex-wrap">
                  <i className="fa-solid fa-location-dot" />
                  <span>P-7 Pangasihan, Gingoog City, Misamis Oriental</span>
                  <a
                    href="https://maps.google.com/?q=Pangasihan,Gingoog+City,Misamis+Oriental"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-growth font-semibold whitespace-nowrap"
                  >
                    Open in Maps <i className="fa-solid fa-arrow-up-right-from-square" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
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
