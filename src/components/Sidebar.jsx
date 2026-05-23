import { Link, useNavigate } from 'react-router-dom';
import { adminAuthController } from '../controllers/adminController.js';
import { useState } from 'react';
import LogoutConfirmModal from './LogoutConfirmModal.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: 'fa-gauge', page: 'dashboard' },
  { label: 'Products', to: '/admin/products', icon: 'fa-box-open', page: 'products' },
  { label: 'Categories', to: '/admin/categories', icon: 'fa-tags', page: 'categories' },
  { label: 'Orders', to: '/admin/orders', icon: 'fa-receipt', page: 'orders' },
  { label: 'Payments', to: '/admin/payments', icon: 'fa-credit-card', page: 'payments' },
  { label: 'Inquiries', to: '/admin/inquiries', icon: 'fa-envelope', page: 'inquiries' },
  { label: 'Settings', to: '/admin/settings', icon: 'fa-gear', page: 'settings' },
];

export default function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  function handleLogout() {
    adminAuthController.logout();
    navigate('/admin/login');
  }

  return (
    <aside className="hidden md:block bg-forest py-5 lg:py-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
      {/* Logo */}
      <div className="text-white font-extrabold text-[0.95rem] lg:text-base px-4 lg:px-5 pb-4 lg:pb-5 border-b border-white/15 mb-3">
        JUDY&apos;S <span className="text-growth">Mini Hardware</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.page}
            to={item.to}
            className={`flex items-center gap-2 lg:gap-2.5 px-4 lg:px-5 py-[11px] lg:py-3 text-[0.88rem] lg:text-[0.9rem] font-medium hover:bg-white/10 hover:text-white transition-colors ${
              activePage === item.page
                ? 'bg-white/10 text-white'
                : 'text-white/75'
            }`}
          >
            <span className="w-4 text-center">
              <i className={`fa-solid ${item.icon}`} />
            </span>
            {item.label}
          </Link>
        ))}

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="flex items-center gap-2 lg:gap-2.5 px-4 lg:px-5 py-[11px] lg:py-3 text-[0.88rem] lg:text-[0.9rem] font-medium text-red-400/85 hover:text-red-300 hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer w-full text-left mt-2"
        >
          <span className="w-4 text-center">
            <i className="fa-solid fa-right-from-bracket" />
          </span>
          Logout
        </button>
      </nav>

      <LogoutConfirmModal
        open={showLogout}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </aside>
  );
}
