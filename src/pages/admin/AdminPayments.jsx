import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  adminAuthController,
  adminPaymentController,
  adminOrderController,
} from '../../controllers/adminController.js';

function PayStatusBadge({ status }) {
  const map = {
    pending:  { cls: 'bg-[#fff3e0] text-[#e65100]', label: 'Pending' },
    approved: { cls: 'bg-[#e8f5e9] text-[#1b5e20]', label: 'Approved' },
    rejected: { cls: 'bg-[#fce4ec] text-[#c62828]', label: 'Rejected' },
  };
  const s = map[status] || { cls: 'bg-[#f5f5f5] text-[#555]', label: status };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[0.75rem] font-bold whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

function fmtAmount(n) {
  return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!adminAuthController.isLoggedIn()) { navigate('/admin/login'); return; }
    loadData();
  }, []);

  function loadData() {
    // Sort newest first — matches original
    const allPayments = adminPaymentController.getAll()
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setPayments(allPayments);
    setOrders(adminOrderController.getAll());
  }

  function handleReview(id, status) {
    const label = status === 'approved' ? 'Approve' : 'Reject';
    if (!window.confirm(`${label} this payment?`)) return;
    adminPaymentController.review(id, status);
    loadData();
  }

  function handleConfirmDelivery(orderId) {
    if (!window.confirm('Confirm delivery for this order?')) return;
    adminOrderController.updateStatus(orderId, 'confirmed');
    loadData();
  }

  function openLightbox(src) {
    setLightboxSrc(src);
    setLightboxOpen(true);
  }

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const pendingCount  = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

  const FILTERS = ['all', 'pending', 'approved', 'rejected'];

  return (
    <AdminLayout activePage="payments">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-forest text-[1.3rem] sm:text-[1.5rem] lg:text-[1.6rem] font-bold">
          <i className="fa-solid fa-peso-sign text-green mr-2" />Payment Verification
        </h1>
        <p className="text-muted text-[0.85rem] sm:text-[0.9rem] mt-1">Review GCash payment submissions and approve or reject them.</p>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden mb-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-[#eee]">
          <div className="text-center p-2.5 rounded-lg bg-[#fff3e0]">
            <div className="text-[1.5rem] font-extrabold text-[#e65100] leading-none">{pendingCount}</div>
            <div className="text-[0.72rem] font-semibold text-[#e65100] mt-0.5">Pending</div>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-[#e8f5e9]">
            <div className="text-[1.5rem] font-extrabold text-[#1b5e20] leading-none">{approvedCount}</div>
            <div className="text-[0.72rem] font-semibold text-[#1b5e20] mt-0.5">Approved</div>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-[#fce4ec]">
            <div className="text-[1.5rem] font-extrabold text-[#c62828] leading-none">{rejectedCount}</div>
            <div className="text-[0.72rem] font-semibold text-[#c62828] mt-0.5">Rejected</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap px-4 py-3.5 border-b border-[#eee]">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-[0.82rem] font-semibold border-2 transition-all cursor-pointer capitalize ${
                filter === f
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-muted border-[#ddd] hover:border-forest hover:text-forest'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Receipt</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Customer</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Product</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Amount</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Delivery</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Method</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Status</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap hidden sm:table-cell">Date</th>
                <th className="bg-light px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-muted font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    <i className="fa-solid fa-inbox text-[1.5rem] block mb-2" />
                    No payments found.
                  </td>
                </tr>
              ) : filtered.map(pay => {
                // Look up the linked order for barangay + delivery info
                const order = orders.find(o => o.id === pay.orderId) || null;
                const barangay = order ? order.barangay : '—';

                // Delivery chip — reads from the order, not the payment
                const deliveryChip = order
                  ? order.deliveryFree
                    ? <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold px-2 py-0.5 rounded-xl bg-[#e8f5e9] text-[#1b5e20]"><i className="fa-solid fa-circle-check" /> FREE</span>
                    : <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold px-2 py-0.5 rounded-xl bg-[#fff3e0] text-[#e65100]"><i className="fa-solid fa-truck" /> ₱{order.deliveryFee}</span>
                  : <span className="text-muted text-[0.78rem]">—</span>;

                // Action buttons — matches original logic exactly
                let actionCell;
                if (pay.status === 'pending') {
                  actionCell = (
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleReview(pay.id, 'approved')}
                        className="bg-[#e8f5e9] text-[#1b5e20] border-0 px-3 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] font-bold hover:bg-[#c8e6c9] transition-colors whitespace-nowrap"
                      >
                        ✔ Approve
                      </button>
                      <button
                        onClick={() => handleReview(pay.id, 'rejected')}
                        className="bg-[#fce4ec] text-[#c62828] border-0 px-3 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] font-bold hover:bg-[#f8bbd0] transition-colors whitespace-nowrap"
                      >
                        ✘ Reject
                      </button>
                    </div>
                  );
                } else if (pay.status === 'approved') {
                  const orderStatus = order ? order.status : '';
                  if (orderStatus !== 'confirmed') {
                    actionCell = (
                      <button
                        onClick={() => handleConfirmDelivery(order ? order.id : '')}
                        className="bg-[#e3f2fd] text-[#1565c0] border-0 px-3 py-1.5 rounded-[6px] cursor-pointer text-[0.78rem] font-bold hover:bg-[#bbdefb] transition-colors whitespace-nowrap"
                      >
                        <i className="fa-solid fa-truck mr-1" />Confirm Delivery
                      </button>
                    );
                  } else {
                    actionCell = (
                      <span className="text-[#1b5e20] text-[0.78rem] font-bold">
                        <i className="fa-solid fa-circle-check mr-1" />Delivered
                      </span>
                    );
                  }
                } else {
                  actionCell = <span className="text-muted text-[0.78rem]">—</span>;
                }

                return (
                  <tr key={pay.id} className="hover:bg-[#fafafa]">
                    {/* Receipt thumbnail */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle">
                      {pay.proofImage
                        ? <img
                            src={pay.proofImage}
                            alt="Receipt"
                            className="w-14 h-14 object-cover rounded-[6px] border-2 border-gray-200 cursor-pointer hover:border-green transition-colors"
                            onClick={() => openLightbox(pay.proofImage)}
                          />
                        : <span className="text-muted text-[0.78rem]">Cash</span>
                      }
                    </td>

                    {/* Customer */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle">
                      <div className="font-bold text-forest text-[0.88rem]">{pay.userName || '—'}</div>
                      <div className="text-[0.75rem] text-muted">{pay.userEmail || ''}</div>
                    </td>

                    {/* Product + barangay */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.85rem] sm:text-[0.9rem] align-middle hidden sm:table-cell">
                      <div className="text-[0.88rem]">{pay.productName || '—'}</div>
                      <div className="text-[0.72rem] text-muted">Barangay: {barangay}</div>
                    </td>

                    {/* Amount — uses amountPaid, formatted with 2 decimals */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle font-bold text-forest">
                      {fmtAmount(pay.amountPaid)}
                    </td>

                    {/* Delivery — from linked order */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle hidden sm:table-cell">
                      {deliveryChip}
                    </td>

                    {/* Payment method — uses paymentMethod field */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle">
                      <span className="text-[0.82rem] font-semibold capitalize">
                        {pay.paymentMethod === 'gcash'
                          ? <><i className="fa-solid fa-mobile-screen-button text-[#0070ba] mr-1" />GCash</>
                          : <><i className="fa-solid fa-money-bill-wave text-[#1b5e20] mr-1" />Cash</>
                        }
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle">
                      <PayStatusBadge status={pay.status} />
                    </td>

                    {/* Date — with time, matches original fmtDate */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] text-[0.78rem] text-muted align-middle hidden sm:table-cell">
                      {fmtDate(pay.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#f0f0f0] align-middle whitespace-nowrap">
                      {actionCell}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/85 z-[9000] flex items-center justify-center p-5"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-5 bg-transparent border-0 text-white text-[2rem] cursor-pointer leading-none"
            aria-label="Close"
          >
            &times;
          </button>
          <img
            src={lightboxSrc}
            alt="Payment Receipt"
            className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </AdminLayout>
  );
}
