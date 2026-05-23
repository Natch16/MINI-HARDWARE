import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { storeController } from '../controllers/userController.js';
import { Store } from '../../js/store.js';

export default function Contact() {
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const s = storeController.getSettings();
    setSettings(s);

    // Pre-fill message from URL param
    const product = searchParams.get('product');
    if (product) {
      setMessage(`I would like to inquire about: ${product}`);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim())    newErrors.name    = 'Full name is required.';
    if (!phone.trim())   newErrors.phone   = 'Contact number is required.';
    if (!message.trim()) newErrors.message = 'Message is required.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Save inquiry to localStorage
    const inquiry = {
      id:        Store.generateId(),
      name:      name.trim(),
      phone:     phone.trim(),
      email:     '',
      subject:   'Customer Inquiry',
      message:   message.trim(),
      read:      false,
      timestamp: new Date().toISOString(),
    };
    const inquiries = Store.getAll(Store.KEYS.INQUIRIES);
    Store.save(Store.KEYS.INQUIRIES, [...inquiries, inquiry]);

    // Reset form and show success
    setName('');
    setPhone('');
    setMessage('');
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 6000);
  }

  const address = settings.address     || 'P-7 Pangasihan, Gingoog City, Misamis Oriental';
  const contact = settings.contactInfo || 'Contact number to be provided';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-forest text-white py-8 sm:py-10 md:py-12 text-center">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <h1 className="text-white" style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)' }}>
              <i className="fa-solid fa-envelope mr-2" />
              Contact Us
            </h1>
            <p className="text-white/80 mt-2 text-[0.95rem] sm:text-base">
              Send us a message and we&apos;ll get back to you as soon as possible
            </p>
          </div>
        </div>

        <section className="py-10 md:py-[60px]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

              {/* Inquiry Form */}
              <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
                <div className="bg-forest px-6 py-5">
                  <h2 className="text-white text-[1.15rem] font-bold mb-1">Send an Inquiry</h2>
                  <p className="text-white/75 text-[0.85rem]">Fill in the form below and we&apos;ll respond promptly.</p>
                </div>
                <div className="p-6">
                  {/* Success Banner */}
                  {success && (
                    <div className="bg-gradient-to-br from-forest to-green text-white rounded-lg p-4 sm:p-5 mb-5 text-center">
                      <div className="text-[2rem] mb-2">
                        <i className="fa-solid fa-circle-check text-white" />
                      </div>
                      <h3 className="text-white text-[1.1rem] font-bold mb-1">Message sent successfully!</h3>
                      <p className="text-white/85 text-[0.88rem]">Thank you for reaching out. We&apos;ll get back to you soon.</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    {/* Full Name */}
                    <div className="mb-4 sm:mb-5">
                      <label className="block font-semibold text-forest text-[0.88rem] sm:text-[0.9rem] mb-1.5">
                        Full Name <span className="text-[#c62828]">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base focus:outline-none focus:border-green transition-colors bg-white"
                      />
                      {errors.name && (
                        <p className="text-[#cc0000] text-[0.8rem] mt-1">
                          <i className="fa-solid fa-triangle-exclamation mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Contact Number */}
                    <div className="mb-4 sm:mb-5">
                      <label className="block font-semibold text-forest text-[0.88rem] sm:text-[0.9rem] mb-1.5">
                        Contact Number <span className="text-[#c62828]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="e.g. 09XX XXX XXXX"
                        autoComplete="tel"
                        className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base focus:outline-none focus:border-green transition-colors bg-white"
                      />
                      {errors.phone && (
                        <p className="text-[#cc0000] text-[0.8rem] mt-1">
                          <i className="fa-solid fa-triangle-exclamation mr-1" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="mb-4 sm:mb-5">
                      <label className="block font-semibold text-forest text-[0.88rem] sm:text-[0.9rem] mb-1.5">
                        Message <span className="text-[#c62828]">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Write your inquiry or message here..."
                        rows={5}
                        className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base focus:outline-none focus:border-green transition-colors bg-white resize-y min-h-[130px]"
                      />
                      {errors.message && (
                        <p className="text-[#cc0000] text-[0.8rem] mt-1">
                          <i className="fa-solid fa-triangle-exclamation mr-1" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-green text-white py-3 rounded-lg font-semibold hover:bg-growth transition-colors mt-1 cursor-pointer border-0"
                    >
                      📨 Send Message
                    </button>

                    <p className="text-[0.75rem] text-muted text-center mt-3">
                      All fields marked with <span className="text-[#c62828]">*</span> are required.
                    </p>
                  </form>
                </div>
              </div>

              {/* Store Info */}
              <div>
                <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden mb-5">
                  <div className="bg-forest px-6 py-4">
                    <h2 className="text-white text-[1.1rem] font-bold">
                      <i className="fa-solid fa-store mr-1.5" />
                      Store Information
                    </h2>
                  </div>
                  <div className="px-6 py-5">
                    {/* Address */}
                    <div className="flex gap-3.5 items-start py-3 border-b border-[#f0f0f0]">
                      <span className="text-[1.3rem] text-green flex-shrink-0 mt-0.5">
                        <i className="fa-solid fa-location-dot" />
                      </span>
                      <div>
                        <div className="text-[0.75rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">Address</div>
                        <div className="text-[0.9rem] text-dark font-medium">{address}</div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex gap-3.5 items-start py-3 border-b border-[#f0f0f0]">
                      <span className="text-[1.3rem] text-green flex-shrink-0 mt-0.5">📞</span>
                      <div>
                        <div className="text-[0.75rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">Contact Number</div>
                        <div className="text-[0.9rem] text-dark font-medium">{contact}</div>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex gap-3.5 items-start py-3 border-b border-[#f0f0f0]">
                      <span className="text-[1.3rem] text-green flex-shrink-0 mt-0.5">
                        <i className="fa-solid fa-clock" />
                      </span>
                      <div>
                        <div className="text-[0.75rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">Business Hours</div>
                        <div className="text-[0.9rem] text-dark font-medium">
                          Mon – Sat: 7:00 AM – 6:00 PM<br />
                          Sun: 8:00 AM – 4:00 PM
                          <span className="block text-[0.78rem] text-[#c62828] font-semibold mt-0.5">
                            <i className="fa-solid fa-triangle-exclamation mr-1" />
                            No delivery on Sundays
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Free Delivery */}
                    <div className="flex gap-3.5 items-start py-3">
                      <span className="text-[1.3rem] text-green flex-shrink-0 mt-0.5">
                        <i className="fa-solid fa-truck" />
                      </span>
                      <div>
                        <div className="text-[0.75rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">Free Delivery Areas</div>
                        <div className="text-[0.9rem] text-dark font-medium">
                          Barangay Talisay &amp; Barangay Pangasihan<br />
                          <span className="text-[0.82rem] text-muted">Gingoog City, Misamis Oriental</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Maps */}
                <div className="rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.10)]">
                  <iframe
                    title="JUDY'S Mini Hardware Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.0!2d124.9!3d8.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPangasihan%2C+Gingoog+City%2C+Misamis+Oriental!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                    width="100%"
                    height="240"
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
