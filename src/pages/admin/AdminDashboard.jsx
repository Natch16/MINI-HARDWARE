import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  adminAuthController,
  dashboardController,
  adminOrderController,
} from '../../controllers/adminController.js';

const SHORTCUTS = [
  { label: 'Products',          to: '/admin/products',   icon: 'fa-box-open' },
  { label: 'Categories',        to: '/admin/categories', icon: 'fa-folder-open' },
  { label: 'Orders',            to: '/admin/orders',     icon: 'fa-cart-shopping' },
  { label: 'Payments',          to: '/admin/payments',   icon: 'fa-peso-sign' },
  { label: 'Inquiries',         to: '/admin/inquiries',  icon: 'fa-envelope' },
  { label: 'Delivery Settings', to: '/admin/settings',   icon: 'fa-gear' },
];

function statusBadge(status) {
  const map = {
    pending:   { cls: 'bg-[#fff8e1] text-[#e65100] border border-[#ffe082]', label: 'Pending' },
    confirmed: { cls: 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]', label: 'Confirmed' },
    cancelled: { cls: 'bg-[#f5f5f5] text-[#555] border border-[#ddd]', label: 'Cancelled' },
  };
  const s = map[status] || { cls: 'bg-[#f5f5f5] text-[#555]', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[0.78rem] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!adminAuthController.isLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    setMetrics(dashboardController.getMetrics());
    const all = adminOrderController.getAll()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentOrders(all);
  }, []);

  const admin = adminAuthController.currentAdmin();
  const adminName = admin
    ? admin.username.charAt(0).toUpperCase() + admin.username.slice(1)
    : 'Admin';

  const now = new Date();
  const hour = now.getHours();
  const tod = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const METRIC_CARDS = [
    { id: 'products',       label: 'Total Products',    icon: 'fa-box-open',     accent: '',              bg: '#e8f5e9', value: metrics.products ?? 0 },
    { id: 'availableStock', label: 'Available Stock',   icon: 'fa-circle-check', accent: '',              bg: '#e8f5e9', value: metrics.availableStock ?? 0 },
    { id: 'totalOrders',    label: 'Total Orders',      icon: 'fa-cart-shopping',accent: 'accent-orange', bg: '#fff3e0', value: metrics.totalOrders ?? 0 },
    { id: 'pendingOrders',  label: 'Pending Orders',    icon: 'fa-clock',        accent: 'accent-orange', bg: '#fff3e0', value: metrics.pendingOrders ?? 0 },
    { id: 'totalSales',     label: 'Sales (Confirmed)', icon: 'fa-peso-sign',    accent: 'accent-blue',   bg: '#e3f2fd', value: metrics.totalSales ?? 0, peso: true },
    { id: 'unreadMsgs',     label: 'Unread Inquiries',  icon: 'fa-envelope',     accent: 'accent-purple', bg: '#f3e5f5', value: metrics.unreadMsgs ?? 0 },
    { id: 'categories',     label: 'Categories',        icon: 'fa-folder-open',  accent: '',              bg: '#e8f5e9', value: metrics.categories ?? 0 },
  ];

  const accentBorder = {
    '':             'border-green',
    'accent-orange':'border-[#e65100]',
    'accent-blue':  'border-[#1565c0]',
    'accent-purple':'border-[#6a1b9a]',
  };

  return (
    <AdminLayout activePage="dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-forest to-[#006400] rounded-lg p-6 sm:p-7 text-white flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-white text-[1.5rem] font-extrabold mb-1">Welcome, {adminName}!</h1>
          <p className="text-white/80 text-[0.88rem] m-0">{tod} — {dateStr}</p>
        </div>
      </div>

      {/* Section label */}
      <p className="text-[0.72rem] uppercase tracking-[0.6px] text-muted font-bold mb-3">Store Overview</p>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-[18px] mb-5">
        {METRIC_CARDS.map(card => (
          <div
            key={card.id}
            className={`bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] p-4 sm:p-5 flex items-center gap-3.5 border-l-4 ${accentBorder[card.accent]} hover:shadow-[0_6px_24px_rgba(0,75,35,0.18)] hover:-translate-y-0.5 transition-all`}
          >
            <div
              className="text-[1.6rem] w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: card.bg }}
            >
              <i className={`fa-solid ${card.icon}`} />
            </div>
            <div>
              <div className="text-[1.6rem] sm:text-[1.7rem] lg:text-[1.8rem] text-forest font-extrabold leading-none">
                {card.peso ? `₱${Number(card.value).toLocaleString()}` : card.value}
              </div>
              <div className="text-[0.78rem] sm:text-[0.85rem] text-muted mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Shortcuts */}
      <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden mb-5">
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#eee] flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">⚡ Quick Shortcuts</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 sm:p-5">
          {SHORTCUTS.map(s => (
            <Link
              key={s.to}
              to={s.to}
              className="flex flex-col items-center gap-2 p-4 sm:p-[18px] bg-light rounded-lg text-forest text-[0.82rem] font-semibold text-center hover:bg-[#e8f5e9] hover:border-green border-2 border-transparent hover:-translate-y-0.5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.10)] transition-all"
            >
              <div className="text-[1.8rem] w-[52px] h-[52px] bg-white rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <i className={`fa-solid ${s.icon}`} />
              </div>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden mb-5">
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#eee] flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
            <i className="fa-solid fa-clock-rotate-left text-green mr-1.5" />
            Recent Orders
          </h2>
          <Link to="/admin/orders" className="bg-green text-white px-3 py-1.5 rounded-lg text-[0.82rem] font-semibold hover:bg-growth transition-colors">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Customer</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Product</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Total</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Status</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted text-[0.9rem]">No orders yet.</td>
                </tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-[#fafafa]">
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle">
                    <strong>{o.userName}</strong>
                    <br /><span className="text-[0.75rem] text-muted">{o.userEmail}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle hidden sm:table-cell">{o.productName}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle font-bold">₱{Number(o.totalPrice).toLocaleString()}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle">{statusBadge(o.status)}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.82rem] text-muted align-middle hidden sm:table-cell">
                    {new Date(o.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
