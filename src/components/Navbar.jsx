import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authController } from '../controllers/userController.js';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = authController.currentUser();

  function isActive(to) {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-[1000] bg-forest px-4 md:px-6 h-[60px] md:h-16 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
      {/* Logo */}
      <Link to="/" className="text-white font-extrabold text-[1.1rem] sm:text-[1.25rem] flex-shrink-0">
        JUDY&apos;S <span className="text-growth">Mini Hardware</span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6 lg:gap-7">
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-[0.95rem] font-medium transition-colors ${
              isActive(link.to) ? 'text-white' : 'text-white/85 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
        {user ? (
          <Link
            to="/account"
            className={`text-[0.95rem] font-medium transition-colors ${
              isActive('/account') ? 'text-white' : 'text-white/85 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-circle-user mr-1.5" />Hi, {user.name.split(' ')[0]}
          </Link>
        ) : (
          <Link
            to="/login"
            className="bg-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-growth transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Hamburger */}
      <button
        className="md:hidden flex flex-col gap-[5px] cursor-pointer bg-transparent border-0 p-1.5"
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className="block w-6 h-[3px] bg-white rounded-sm" />
        <span className="block w-6 h-[3px] bg-white rounded-sm" />
        <span className="block w-6 h-[3px] bg-white rounded-sm" />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-[60px] left-0 right-0 bg-forest flex flex-col px-5 pt-4 pb-6 gap-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-[999]">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className={`text-[0.95rem] font-medium w-full transition-colors ${
                isActive(link.to) ? 'text-white' : 'text-white/85 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link
              to="/account"
              onClick={closeMenu}
              className="text-white/85 text-[0.95rem] font-medium w-full hover:text-white transition-colors"
            >
              <i className="fa-solid fa-circle-user mr-1.5" />Hi, {user.name.split(' ')[0]}
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="bg-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-growth transition-colors text-center"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
