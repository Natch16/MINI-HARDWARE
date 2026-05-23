import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { storeController } from '../controllers/userController.js';

export default function About() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    setSettings(storeController.getSettings());
  }, []);

  const contact = settings.contactInfo || 'Contact number to be provided';
  const address = settings.address     || 'P-7 Pangasihan, Gingoog City, Misamis Oriental';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-forest text-white py-8 sm:py-10 md:py-12 text-center">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <h1 className="text-white" style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)' }}>
              About JUDY&apos;S Mini Hardware
            </h1>
            <p className="text-white/80 mt-2 text-[0.95rem] sm:text-base">
              Our story, mission, and commitment to the community
            </p>
          </div>
        </div>

        {/* Story Section */}
        <section className="py-10 md:py-[60px]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-12 items-center">
              <div>
                <h2 className="text-forest mb-2.5" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
                  Our Story
                </h2>
                <p className="text-muted mb-4">
                  JUDY&apos;S Mini Hardware was founded with a simple dream — to provide the local community with quality hardware products at fair prices. What started as a small corner store has grown into a trusted neighborhood hardware destination.
                </p>
                <p className="text-muted mb-4">
                  For years, we have been the go-to source for homeowners, contractors, and DIY enthusiasts looking for tools, construction materials, electrical supplies, and plumbing essentials. Our knowledgeable staff is always ready to help you find exactly what you need.
                </p>
                <p className="text-muted">
                  We take pride in our personal approach to customer service. When you walk through our doors, you&apos;re not just a customer — you&apos;re part of the JUDY&apos;S family.
                </p>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80"
                  alt="JUDY'S Mini Hardware Store"
                  className="w-full rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-10 md:py-[60px] bg-light">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-forest mb-2.5" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              Mission &amp; Vision
            </h2>
            <p className="text-muted mb-7 sm:mb-10 text-base sm:text-[1.05rem]">
              What drives us every day
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-2">
              <div className="bg-light rounded-lg p-4 sm:p-6 border-l-4 border-green text-left">
                <h3 className="text-forest font-bold mb-2 sm:mb-2.5" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                  🎯 Our Mission
                </h3>
                <p className="text-muted">
                  To provide our community with high-quality hardware products and expert guidance, making every construction and repair project a success — at prices everyone can afford.
                </p>
              </div>
              <div className="bg-light rounded-lg p-4 sm:p-6 border-l-4 border-green text-left">
                <h3 className="text-forest font-bold mb-2 sm:mb-2.5" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                  🌟 Our Vision
                </h3>
                <p className="text-muted">
                  To be the most trusted and reliable hardware store in the region, known for our exceptional service, wide product selection, and deep commitment to customer satisfaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-10 md:py-[60px]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-forest mb-2.5" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              Our Values
            </h2>
            <p className="text-muted mb-7 sm:mb-10 text-base sm:text-[1.05rem]">
              The principles that guide everything we do
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-2">
              <div className="bg-light rounded-lg p-4 sm:p-6 border-l-4 border-green text-left">
                <h3 className="text-forest font-bold mb-2 sm:mb-2.5" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                  <i className="fa-solid fa-handshake text-green mr-1.5" />
                  Community First
                </h3>
                <p className="text-muted">
                  We serve our neighbors and support local builders, homeowners, and tradespeople.
                </p>
              </div>
              <div className="bg-light rounded-lg p-4 sm:p-6 border-l-4 border-green text-left">
                <h3 className="text-forest font-bold mb-2 sm:mb-2.5" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                  <i className="fa-solid fa-circle-check text-green mr-1.5" />
                  Quality Products
                </h3>
                <p className="text-muted">
                  We stock only reliable, durable products that stand up to real-world use.
                </p>
              </div>
              <div className="bg-light rounded-lg p-4 sm:p-6 border-l-4 border-green text-left">
                <h3 className="text-forest font-bold mb-2 sm:mb-2.5" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                  <i className="fa-solid fa-tag text-green mr-1.5" />
                  Honest Pricing
                </h3>
                <p className="text-muted">
                  Fair, transparent pricing with no hidden fees — always.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Location & Map */}
        <section className="py-10 md:py-[60px] bg-light">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-7 sm:mb-10">
              <h2 className="text-forest mb-2.5" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
                Find Our Store
              </h2>
              <p className="text-muted text-base sm:text-[1.05rem]">
                Visit us in Gingoog City, Misamis Oriental
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 items-start">
              {/* Store info */}
              <div>
                <div className="flex gap-3 sm:gap-3.5 items-start mb-4 sm:mb-5">
                  <span className="text-[1.3rem] sm:text-[1.5rem] text-green flex-shrink-0">
                    <i className="fa-solid fa-location-dot" />
                  </span>
                  <div>
                    <strong className="text-dark">Store Address</strong>
                    <p className="text-muted">{address}</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-3.5 items-start mb-4 sm:mb-5">
                  <span className="text-[1.3rem] sm:text-[1.5rem] text-green flex-shrink-0">
                    <i className="fa-solid fa-phone" />
                  </span>
                  <div>
                    <strong className="text-dark">Contact Number</strong>
                    <p className="text-muted">{contact}</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-3.5 items-start mb-4 sm:mb-5">
                  <span className="text-[1.3rem] sm:text-[1.5rem] text-green flex-shrink-0">
                    <i className="fa-solid fa-clock" />
                  </span>
                  <div>
                    <strong className="text-dark">Business Hours</strong>
                    <p className="text-muted">Monday – Saturday: 7:00 AM – 6:00 PM</p>
                    <p className="text-muted">
                      Sunday: 8:00 AM – 4:00 PM{' '}
                      <span className="text-[#c62828] text-[0.82rem] font-semibold">(No delivery on Sundays)</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-3.5 items-start">
                  <span className="text-[1.3rem] sm:text-[1.5rem] text-green flex-shrink-0">
                    <i className="fa-solid fa-truck" />
                  </span>
                  <div>
                    <strong className="text-dark">Free Delivery Areas</strong>
                    <p className="text-muted">Barangay Talisay &amp; Barangay Pangasihan, Gingoog City</p>
                    <p className="text-muted text-[0.82rem] mt-1">₱80 delivery fee for other locations</p>
                    <p className="text-[0.82rem] mt-1 text-[#c62828] font-semibold">
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
                  height="300"
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

        {/* CTA Banner */}
        <section className="bg-green text-white text-center py-9 sm:py-12 px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-white mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              Visit JUDY&apos;S Mini Hardware Today!
            </h2>
            <p className="text-white/90 mb-5 sm:mb-6">
              Come see our full selection in store or get in touch with any questions.
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
      <Footer />
    </div>
  );
}
