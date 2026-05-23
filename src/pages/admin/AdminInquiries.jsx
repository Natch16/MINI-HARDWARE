import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  adminAuthController,
  inquiryController,
} from '../../controllers/adminController.js';

export default function AdminInquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    if (!adminAuthController.isLoggedIn()) { navigate('/admin/login'); return; }
    loadInquiries();
  }, []);

  function loadInquiries() {
    const all = inquiryController.getAll()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setInquiries(all);
  }

  function handleSelect(inquiry) {
    if (!inquiry.read) {
      inquiryController.markRead(inquiry.id);
      loadInquiries();
      setSelectedInquiry({ ...inquiry, read: true });
    } else {
      setSelectedInquiry(inquiry);
    }
  }

  function handleMarkUnread(id) {
    inquiryController.markUnread(id);
    loadInquiries();
    setSelectedInquiry(prev => prev && prev.id === id ? { ...prev, read: false } : prev);
  }

  function handleMarkRead(id) {
    inquiryController.markRead(id);
    loadInquiries();
    setSelectedInquiry(prev => prev && prev.id === id ? { ...prev, read: true } : prev);
  }

  function handleDelete(id) {
    if (!confirm('Delete this inquiry?')) return;
    inquiryController.delete(id);
    loadInquiries();
    if (selectedInquiry && selectedInquiry.id === id) setSelectedInquiry(null);
  }

  const unreadCount = inquiries.filter(i => !i.read).length;
  const filtered = filter === 'all'
    ? inquiries
    : filter === 'unread'
      ? inquiries.filter(i => !i.read)
      : inquiries.filter(i => i.read);

  const FILTERS = [
    { key: 'all',    label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'read',   label: 'Read' },
  ];

  return (
    <AdminLayout activePage="inquiries">
      <div className="mb-5 sm:mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-forest text-[1.3rem] sm:text-[1.5rem] lg:text-[1.6rem] font-bold">
            <i className="fa-solid fa-envelope text-green mr-2" />Customer Inquiries
          </h1>
          <p className="text-muted text-[0.85rem] sm:text-[0.9rem] mt-1">Messages submitted through the contact form.</p>
        </div>
        {unreadCount > 0 && (
          <span className="text-[0.88rem] text-green font-bold bg-[#e8f5e9] px-3 py-1 rounded-xl">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-xl text-[0.82rem] font-semibold border-2 transition-all cursor-pointer ${
              filter === f.key
                ? 'bg-green text-white border-green'
                : 'bg-white text-muted border-[#ddd] hover:bg-green hover:border-green hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">

        {/* LEFT: Inquiry list */}
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
          <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 border-b border-[#eee]">
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">Messages</h2>
          </div>
          <div>
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-muted">No messages found.</div>
            ) : filtered.map(inq => (
              <div
                key={inq.id}
                onClick={() => handleSelect(inq)}
                className={`px-4 sm:px-[18px] py-3 sm:py-3.5 border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                  !inq.read
                    ? 'border-l-4 border-green bg-[#f0faf0] hover:bg-[#e8f5e9]'
                    : 'hover:bg-[#fafafa]'
                } ${selectedInquiry && selectedInquiry.id === inq.id ? 'bg-[#f0faf0]' : ''}`}
              >
                <div className="flex justify-between items-center mb-0.5 gap-2">
                  <span className="font-bold text-forest text-[0.9rem] sm:text-[0.95rem] flex items-center">
                    {!inq.read && (
                      <span className="inline-block w-[7px] sm:w-2 h-[7px] sm:h-2 bg-green rounded-full mr-1.5 flex-shrink-0" />
                    )}
                    {inq.name}
                  </span>
                  <span className="text-[0.72rem] sm:text-[0.78rem] text-muted whitespace-nowrap">
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
                <div className="text-[0.85rem] sm:text-[0.9rem] text-dark mb-0.5">{inq.subject}</div>
                <div className="text-[0.78rem] sm:text-[0.82rem] text-muted whitespace-nowrap overflow-hidden text-ellipsis">{inq.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Detail panel */}
        {selectedInquiry && (
          <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
            <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 border-b border-[#eee] flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">Message Detail</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="bg-[#eee] text-dark border-0 px-3 py-1.5 rounded-lg cursor-pointer text-[0.85rem] hover:bg-[#ddd] transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 sm:p-5">
              <div className="mb-3">
                <div className="text-[0.72rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">From</div>
                <div className="font-bold text-forest text-[0.95rem]">{selectedInquiry.name}</div>
              </div>
              <div className="mb-3">
                <div className="text-[0.72rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">Email</div>
                <div className="text-[0.9rem] text-dark">{selectedInquiry.email}</div>
              </div>
              {selectedInquiry.phone && (
                <div className="mb-3">
                  <div className="text-[0.72rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">Phone</div>
                  <div className="text-[0.9rem] text-dark">{selectedInquiry.phone}</div>
                </div>
              )}
              <div className="mb-3">
                <div className="text-[0.72rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">Subject</div>
                <div className="text-[0.9rem] font-semibold text-dark">{selectedInquiry.subject}</div>
              </div>
              <div className="mb-3">
                <div className="text-[0.72rem] uppercase tracking-[0.4px] text-muted font-semibold mb-0.5">Date</div>
                <div className="text-[0.9rem] text-muted">
                  {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString('en-PH') : '—'}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-[0.72rem] uppercase tracking-[0.4px] text-muted font-semibold mb-1">Message</div>
                <div className="text-[0.9rem] text-dark bg-light rounded-lg p-3 leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</div>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {selectedInquiry.read ? (
                  <button
                    onClick={() => handleMarkUnread(selectedInquiry.id)}
                    className="bg-[#e3f2fd] text-[#1565c0] border-0 px-3.5 py-2 rounded-lg cursor-pointer text-[0.85rem] font-semibold hover:bg-[#bbdefb] transition-colors"
                  >
                    <i className="fa-solid fa-envelope mr-1" /> Mark Unread
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkRead(selectedInquiry.id)}
                    className="bg-[#e8f5e9] text-[#1b5e20] border-0 px-3.5 py-2 rounded-lg cursor-pointer text-[0.85rem] font-semibold hover:bg-[#c8e6c9] transition-colors"
                  >
                    <i className="fa-solid fa-envelope-open mr-1" /> Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="bg-[#fce4ec] text-[#c62828] border-0 px-3.5 py-2 rounded-lg cursor-pointer text-[0.85rem] font-semibold hover:bg-[#f8bbd0] transition-colors"
                >
                  <i className="fa-solid fa-trash mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
