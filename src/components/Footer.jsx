import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeController } from '../controllers/userController.js';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    setSettings(storeController.getSettings());
  }, []);

  const businessName = settings.businessName || "JUDY'S Mini Hardware";
  const tagline = settings.tagline || 'Your trusted local hardware store.';
  const contactInfo = settings.contactInfo || '';
  const address = settings.address || 'P-7 Pangasihan, Gingoog City, Misamis Oriental';

  return (
    <footer className="bg-forest text-white pt-9 sm:pt-12 pb-5 sm:pb-6">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-6 sm:gap-7 lg:gap-10 mb-6 lg:mb-8">
          {/* Column 1: Brand */}
          <div>
            <div className="font-extrabold text-base mb-2">{businessName}</div>
            <p className="text-white/85 text-[0.88rem] mb-2">{tagline}</p>
            <div className="flex gap-2.5 mt-2 flex-wrap">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-[34px] sm:w-9 h-[34px] sm:h-9 bg-white/10 rounded-full text-[0.95rem] hover:bg-growth transition-colors"
                aria-label="Facebook"
              >
                <i className="fa-brands fa-facebook-f" />
              </a>
              <a
                href="https://m.me/judysminihardware"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-[34px] sm:w-9 h-[34px] sm:h-9 bg-white/10 rounded-full text-[0.95rem] hover:bg-growth transition-colors"
                aria-label="Messenger"
              >
                <i className="fa-brands fa-facebook-messenger" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-[0.95rem] sm:text-base">
              Quick Links
            </h4>
            {QUICK_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/85 text-[0.88rem] block mb-2 hover:text-growth transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-[0.95rem] sm:text-base">
              Contact
            </h4>
            {address && (
              <p className="text-white/85 text-[0.88rem] mb-2">{address}</p>
            )}
            {contactInfo && (
              <p className="text-white/85 text-[0.88rem] mb-2">{contactInfo}</p>
            )}
          </div>
        </div>

        <div className="border-t border-white/15 pt-4 text-center text-[0.82rem] text-white">
          &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
