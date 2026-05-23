import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { adminAuthController } from '../controllers/adminController.js';
import LogoutConfirmModal from './LogoutConfirmModal.jsx';

const DRAWER_LINKS = [
  { label: 'Dashboard', to: '/admin', icon: 'fa-gauge', page: 'dashboard' },
  { label: 'Products', to: '/admin/products', icon: 'fa-box-open', page: 'products' },
  { label: 'Categories', to: '/admin/categories', icon: 'fa-tags', page: 'categories' },
  { label: 'Orders', to: '/admin/orders', icon: 'fa-receipt', page: 'orders' },
  { label: 'Payments', to: '/admin/payments', icon: 'fa-credit-card', page: 'payments' },
  { label: 'Inquiries', to: '/admin/inquiries', icon: 'fa-envelope', page: 'inquiries' },
  { label: 'Settings', to: '/admin/settings', icon: 'fa-gear', page: 'settings' },
];

export default function AdminLayout({ children, activePage }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleLogout() {
    adminAuthController.logout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin top navbar */}
      <header className="sticky top-0 z-[1000] bg-forest h-[60px] md:h-16 flex items-center px-4 md:px-6 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
        <Link to="/admin" className="text-white font-extrabold text-[1.1rem] sm:text-[1.25rem] flex-1">
          JUDY&apos;S <span className="text-growth">Admin</span>
        </Link>

        {/* Hamburger (mobile only) */}
        <button
          className="md:hidden flex flex-col gap-[5px] cursor-pointer bg-transparent border-0 p-1.5"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <span className="block w-6 h-[3px] bg-white rounded-sm" />
          <span className="block w-6 h-[3px] bg-white rounded-sm" />
          <span className="block w-6 h-[3px] bg-white rounded-sm" />
        </button>
      </header>

      {/* Content area */}
      <div className="flex flex-1">
        <Sidebar activePage={activePage} />
        <main className="flex-1 bg-light p-4 md:p-6 lg:p-8 overflow-y-auto pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1100]"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[260px] max-w-[80vw] bg-forest z-[1200] transform transition-transform duration-[280ms] flex flex-col overflow-y-auto ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/15 flex-shrink-0">
          <span className="text-white font-extrabold text-base">
            JUDY&apos;S <span className="text-growth">Mini Hardware</span>
          </span>
          <button
            onClick={closeDrawer}
            className="bg-transparent border-0 text-white/70 hover:text-white text-2xl cursor-pointer leading-none p-0"
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex flex-col py-2 flex-1">
          {DRAWER_LINKS.map(item => (
            <Link
              key={item.page}
              to={item.to}
              onClick={closeDrawer}
              className={`flex items-center gap-2.5 px-5 py-[13px] text-[0.95rem] font-medium hover:bg-white/10 hover:text-white transition-colors ${
                activePage === item.page
                  ? 'bg-white/10 text-white'
                  : 'text-white/78'
              }`}
            >
              <span className="w-5 text-center flex-shrink-0">
                <i className={`fa-solid ${item.icon} text-[1.1rem]`} />
              </span>
              {item.label}
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={() => { closeDrawer(); setShowLogout(true); }}
            className="flex items-center gap-2.5 px-5 py-[13px] text-[0.95rem] font-medium text-red-400/85 hover:text-red-300 hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer w-full text-left mt-2"
          >
            <span className="w-5 text-center flex-shrink-0">
              <i className="fa-solid fa-right-from-bracket text-[1.1rem]" />
            </span>
            Logout
          </button>
        </nav>
      </div>

      <LogoutConfirmModal
        open={showLogout}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
}
