import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  adminAuthController,
  adminOrderController,
} from '../../controllers/adminController.js';

function StatusBadge({ status }) {
  const map = {
    pending:          { cls: 'bg-[#fff8e1] text-[#e65100] border border-[#ffe082]',   icon: 'fa-clock',        label: 'Pending' },
    payment_pending:  { cls: 'bg-[#e3f2fd] text-[#1565c0] border border-[#90caf9]',   icon: 'fa-hourglass-half', label: 'Awaiting Payment' },
    paid:             { cls: 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]',   icon: 'fa-circle-check', label: 'Paid' },
    payment_rejected: { cls: 'bg-[#fce4ec] text-[#c62828] border border-[#f48fb1]',   icon: 'fa-circle-xmark', label: 'Payment Rejected' },
    confirmed:        { cls: 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]',   icon: 'fa-circle-check', label: 'Confirmed' },
    cancelled:        { cls: 'bg-[#f5f5f5] text-[#555] border border-[#ddd]',          icon: 'fa-ban',          label: 'Cancelled' },
  };
  const s = map[status] || { cls: 'bg-[#f5f5f5] text-[#555]', icon: 'fa-circle', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[0.78rem] font-bold ${s.cls}`}>
      <i className={`fa-solid ${s.icon}`} />
      {s.label}
    </span>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!adminAuthController.isLoggedIn()) { navigate('/admin/login'); return; }
    loadOrders();
  }, []);

  function loadOrders() {
    const all = adminOrderController.getAll()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(all);
  }

  function updateStatus(id, status) {
    if (status === 'cancelled' && !window.confirm('Cancel this order?')) return;
    adminOrderController.updateStatus(id, status);
    loadOrders();
    if (selectedOrder && selectedOrder.id === id) {
      const updated = adminOrderController.getAll().find(o => o.id === id);
      setSelectedOrder(updated || null);
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const total            = orders.length;
  const pending          = orders.filter(o => o.status === 'pending').length;
  const payment_pending  = orders.filter(o => o.status === 'payment_pending').length;
  const paid             = orders.filter(o => o.status === 'paid').length;
  const payment_rejected = orders.filter(o => o.status === 'payment_rejected').length;
  const confirmed        = orders.filter(o => o.status === 'confirmed').length;
  const cancelled        = orders.filter(o => o.status === 'cancelled').length;

  const FILTERS = [
    { key: 'all',              label: 'All' },
    { key: 'pending',          label: 'Pending' },
    { key: 'payment_pending',  label: 'Awaiting Payment' },
    { key: 'paid',             label: 'Paid' },
    { key: 'payment_rejected', label: 'Payment Rejected' },
    { key: 'confirmed',        label: 'Confirmed' },
    { key: 'cancelled',        label: 'Cancelled' },
  ];

  return (
    <AdminLayout activePage="orders">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-forest text-[1.3rem] sm:text-[1.5rem] lg:text-[1.6rem] font-bold">
          <i className="fa-solid fa-cart-shopping text-green mr-2" />Orders
        </h1>
        <p className="text-muted text-[0.85rem] sm:text-[0.9rem] mt-1">All customer orders placed through the website.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {[
          { label: 'Total',            num: total,            cls: 'text-forest' },
          { label: 'Pending',          num: pending,          cls: 'text-[#e65100]' },
          { label: 'Awaiting Payment', num: payment_pending,  cls: 'text-[#1565c0]' },
          { label: 'Paid',             num: paid,             cls: 'text-[#1b5e20]' },
          { label: 'Confirmed',        num: confirmed,        cls: 'text-[#1b5e20]' },
          { label: 'Cancelled',        num: cancelled,        cls: 'text-[#555]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] p-3 sm:p-3.5 text-center">
            <div className={`text-[1.4rem] sm:text-[1.6rem] font-extrabold leading-none ${s.cls}`}>{s.num}</div>
            <div className="text-[0.7rem] sm:text-[0.75rem] text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden mb-4">
        <div className="px-3 sm:px-4 py-3 flex gap-2 flex-wrap items-center">
          <span className="text-[0.85rem] font-semibold text-forest mr-1">
            <i className="fa-solid fa-filter" /> Filter:
          </span>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setSelectedOrder(null); }}
              className={`px-3 py-1.5 rounded-xl text-[0.82rem] font-semibold border-2 transition-colors cursor-pointer ${
                filter === f.key
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-muted border-[#ddd] hover:border-forest hover:text-forest'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden mb-4">
        <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 border-b border-[#eee] flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
            <i className="fa-solid fa-table-list mr-1.5" />Order List
          </h2>
          <span className="text-[0.82rem] text-muted font-semibold bg-light px-2.5 py-0.5 rounded-xl">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Customer</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Product</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Qty</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Total</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Barangay</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Status</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Date</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">
                    <i className="fa-solid fa-cart-shopping text-[2rem] block mb-2.5 opacity-30" />
                    No orders found.
                  </td>
                </tr>
              ) : filtered.map(o => (
                <tr
                  key={o.id}
                  className="hover:bg-[#fafafa] cursor-pointer"
                  onClick={e => { if (e.target.closest('button')) return; setSelectedOrder(o); }}
                >
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle">
                    <strong>{o.userName}</strong>
                    <br /><span className="text-[0.75rem] text-muted">{o.userEmail}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle hidden sm:table-cell">{o.productName}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle text-center hidden sm:table-cell">{o.quantity}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle">
                    <strong>₱{Number(o.totalPrice).toLocaleString()}</strong>
                    <br />
                    <span className={`text-[0.75rem] font-semibold ${o.deliveryFree ? 'text-[#1b5e20]' : 'text-[#e65100]'}`}>
                      <i className="fa-solid fa-truck mr-0.5" />
                      {o.deliveryFree ? 'Free' : `₱${o.deliveryFee}`}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle">{o.barangay}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle"><StatusBadge status={o.status} /></td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.82rem] text-muted align-middle">
                    {new Date(o.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle whitespace-nowrap">
                    <div className="flex gap-1.5 flex-wrap">
                      {/* Confirm — only for pending */}
                      {o.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(o.id, 'confirmed')}
                          className="bg-[#e3f2fd] text-[#1565c0] border-0 px-2.5 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] font-semibold hover:bg-[#bbdefb] transition-colors whitespace-nowrap"
                        >
                          <i className="fa-solid fa-circle-check mr-0.5" /> Confirm
                        </button>
                      )}
                      {/* Confirm Delivery — only for paid (GCash approved, not yet delivered) */}
                      {o.status === 'paid' && (
                        <button
                          onClick={() => updateStatus(o.id, 'confirmed')}
                          className="bg-[#e8f5e9] text-[#1b5e20] border-0 px-2.5 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] font-semibold hover:bg-[#c8e6c9] transition-colors whitespace-nowrap"
                        >
                          <i className="fa-solid fa-truck mr-0.5" /> Confirm Delivery
                        </button>
                      )}
                      {/* Cancel — available on any non-terminal status */}
                      {o.status !== 'confirmed' && o.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(o.id, 'cancelled')}
                          className="bg-[#fce4ec] text-[#c62828] border-0 px-2.5 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] font-semibold hover:bg-[#f8bbd0] transition-colors whitespace-nowrap"
                        >
                          <i className="fa-solid fa-ban mr-0.5" /> Cancel
                        </button>
                      )}
                      {/* Terminal states — no actions */}
                      {(o.status === 'confirmed' || o.status === 'cancelled') && (
                        <span className="text-muted text-[0.78rem]">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden mb-4">
          <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 border-b border-[#eee] flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
              <i className="fa-solid fa-receipt mr-1.5" />Order Details
            </h2>
            <button
              onClick={() => setSelectedOrder(null)}
              className="bg-[#eee] text-dark border-0 px-3 py-1.5 rounded-lg cursor-pointer text-[0.85rem] hover:bg-[#ddd] transition-colors"
            >
              <i className="fa-solid fa-xmark mr-1" /> Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {[
              { label: 'Customer Name', value: selectedOrder.userName, icon: 'fa-user' },
              { label: 'Email', value: selectedOrder.userEmail, icon: 'fa-envelope' },
              { label: 'Product', value: selectedOrder.productName, icon: 'fa-box-open' },
              { label: 'Quantity', value: selectedOrder.quantity, icon: 'fa-hashtag' },
              { label: 'Unit Price', value: `₱${Number(selectedOrder.productPrice).toLocaleString()}`, icon: 'fa-peso-sign' },
              { label: 'Delivery Fee', value: selectedOrder.deliveryFree ? 'FREE' : `₱${selectedOrder.deliveryFee}`, icon: 'fa-truck', green: selectedOrder.deliveryFree },
              { label: 'Total Price', value: `₱${Number(selectedOrder.totalPrice).toLocaleString()}`, icon: 'fa-peso-sign', bold: true },
              { label: 'Status', value: <StatusBadge status={selectedOrder.status} />, icon: 'fa-circle-half-stroke' },
              { label: 'Barangay', value: selectedOrder.barangay, icon: 'fa-location-dot' },
              { label: 'Full Address', value: selectedOrder.address || '—', icon: 'fa-map-marker-alt' },
              { label: 'Date Placed', value: new Date(selectedOrder.createdAt).toLocaleString('en-PH'), icon: 'fa-calendar' },
              { label: 'Notes', value: selectedOrder.notes || '—', icon: 'fa-note-sticky' },
            ].map((cell, i) => (
              <div key={i} className="px-4 sm:px-5 py-3.5 border-b border-[#f0f0f0] border-r-0 sm:odd:border-r sm:border-r-[#f0f0f0]">
                <div className="text-[0.72rem] uppercase tracking-[0.4px] text-muted font-semibold mb-1">
                  <i className={`fa-solid ${cell.icon} mr-1`} />{cell.label}
                </div>
                <div className={`text-[0.9rem] font-medium ${cell.bold ? 'font-extrabold text-green text-[1.05rem]' : ''} ${cell.green ? 'text-[#1b5e20] font-bold' : 'text-dark'}`}>
                  {cell.value}
                </div>
              </div>
            ))}
          </div>
          {selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'cancelled' && (
            <div className="px-4 sm:px-5 py-3.5 border-t border-[#eee] flex gap-2.5 flex-wrap">
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => updateStatus(selectedOrder.id, 'confirmed')}
                  className="bg-green text-white border-0 px-4 py-2 rounded-lg cursor-pointer text-[0.85rem] font-semibold hover:bg-growth transition-colors"
                >
                  <i className="fa-solid fa-circle-check mr-1" /> Confirm Order
                </button>
              )}
              {selectedOrder.status === 'paid' && (
                <button
                  onClick={() => updateStatus(selectedOrder.id, 'confirmed')}
                  className="bg-green text-white border-0 px-4 py-2 rounded-lg cursor-pointer text-[0.85rem] font-semibold hover:bg-growth transition-colors"
                >
                  <i className="fa-solid fa-truck mr-1" /> Confirm Delivery
                </button>
              )}
              <button
                onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                className="bg-[#fce4ec] text-[#c62828] border-0 px-4 py-2 rounded-lg cursor-pointer text-[0.85rem] font-semibold hover:bg-[#f8bbd0] transition-colors"
              >
                <i className="fa-solid fa-ban mr-1" /> Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
