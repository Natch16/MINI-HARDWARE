import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  adminAuthController,
  settingsController,
  adminPaymentController,
} from '../../controllers/adminController.js';

const CREDS_KEY = 'jh_admin_creds';
const DEFAULT_CREDS = { username: 'admin', password: 'admin123' };

function getStoredCreds() {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CREDS;
  } catch {
    return DEFAULT_CREDS;
  }
}

function SuccessMsg({ show, msg }) {
  if (!show) return null;
  return (
    <div className="bg-[#e8f5e9] border border-green text-forest rounded-lg px-3.5 py-2.5 text-[0.88rem] mb-4 flex items-center gap-2">
      <i className="fa-solid fa-circle-check" /> {msg}
    </div>
  );
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const gcashFileRef = useRef();

  // Store info
  const [storeForm, setStoreForm] = useState({ businessName: '', contactInfo: '', address: '' });
  const [storeSuccess, setStoreSuccess] = useState(false);

  // Business hours
  const [hoursForm, setHoursForm] = useState({ hoursWeekday: '', hoursSunday: '' });
  const [hoursSuccess, setHoursSuccess] = useState(false);

  // Delivery
  const [deliveryForm, setDeliveryForm] = useState({ deliveryFee: '', deliveryNote: '' });
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  // GCash
  const [gcashForm, setGcashForm] = useState({ gcashName: '', gcashNumber: '', gcashQr: '' });
  const [gcashSuccess, setGcashSuccess] = useState(false);

  // Credentials
  const [credsForm, setCredsForm] = useState({ username: '', currentPassword: '', newPassword: '' });
  const [credsSuccess, setCredsSuccess] = useState(false);
  const [credsError, setCredsError] = useState('');

  useEffect(() => {
    if (!adminAuthController.isLoggedIn()) { navigate('/admin/login'); return; }
    const s = settingsController.get();
    setStoreForm({
      businessName: s.businessName || '',
      contactInfo:  s.contactInfo  || '',
      address:      s.address      || '',
    });
    setHoursForm({
      hoursWeekday: s.hoursWeekday || '',
      hoursSunday:  s.hoursSunday  || '',
    });
    setDeliveryForm({
      deliveryFee:  s.deliveryFee  !== undefined ? String(s.deliveryFee) : '',
      deliveryNote: s.deliveryNote || '',
    });
    // Load GCash from jh_gcash (authoritative) with settings as fallback
    const gcashStored = adminPaymentController.getAll ? null : null;
    let gcashRaw = { name: '', number: '', qrSrc: '' };
    try {
      const raw = localStorage.getItem('jh_gcash');
      if (raw) gcashRaw = { ...gcashRaw, ...JSON.parse(raw) };
    } catch {}
    setGcashForm({
      gcashName:   gcashRaw.name   || s.gcashName   || '',
      gcashNumber: gcashRaw.number || s.gcashNumber || '',
      gcashQr:     gcashRaw.qrSrc  || s.gcashQr     || '',
    });    const creds = getStoredCreds();
    setCredsForm({ username: creds.username, currentPassword: '', newPassword: '' });
  }, []);

  function showSuccess(setter) {
    setter(true);
    setTimeout(() => setter(false), 3000);
  }

  function handleStoreSubmit(e) {
    e.preventDefault();
    settingsController.save({ businessName: storeForm.businessName, contactInfo: storeForm.contactInfo, address: storeForm.address });
    showSuccess(setStoreSuccess);
  }

  function handleHoursSubmit(e) {
    e.preventDefault();
    settingsController.save({ hoursWeekday: hoursForm.hoursWeekday, hoursSunday: hoursForm.hoursSunday });
    showSuccess(setHoursSuccess);
  }

  function handleDeliverySubmit(e) {
    e.preventDefault();
    settingsController.save({ deliveryFee: Number(deliveryForm.deliveryFee) || 0, deliveryNote: deliveryForm.deliveryNote });
    showSuccess(setDeliverySuccess);
  }

  function handleGcashFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setGcashForm(f => ({ ...f, gcashQr: ev.target.result }));
    reader.readAsDataURL(file);
  }

  function removeGcashQr() {
    setGcashForm(f => ({ ...f, gcashQr: '' }));
    if (gcashFileRef.current) gcashFileRef.current.value = '';
  }

  function handleGcashSubmit(e) {
    e.preventDefault();
    settingsController.save({ gcashName: gcashForm.gcashName, gcashNumber: gcashForm.gcashNumber, gcashQr: gcashForm.gcashQr });
    adminPaymentController.saveGcashConfig({ name: gcashForm.gcashName, number: gcashForm.gcashNumber, qrSrc: gcashForm.gcashQr });
    showSuccess(setGcashSuccess);
  }

  function handleCredsSubmit(e) {
    e.preventDefault();
    setCredsError('');
    const stored = getStoredCreds();
    if (credsForm.currentPassword !== stored.password) {
      setCredsError('Current password is incorrect.');
      return;
    }
    if (!credsForm.username.trim()) {
      setCredsError('Username cannot be empty.');
      return;
    }
    const newCreds = {
      username: credsForm.username.trim(),
      password: credsForm.newPassword || stored.password,
    };
    localStorage.setItem(CREDS_KEY, JSON.stringify(newCreds));
    setCredsForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
    showSuccess(setCredsSuccess);
  }

  const inputCls = "w-full px-3 py-2.5 border-2 border-[#ddd] rounded-lg text-[0.95rem] focus:outline-none focus:border-green transition-colors bg-white";
  const labelCls = "block font-semibold text-[0.9rem] text-forest mb-1.5";
  const cardHeaderCls = "px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#eee]";
  const cardBodyCls = "p-4 sm:p-5";

  return (
    <AdminLayout activePage="settings">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-forest text-[1.3rem] sm:text-[1.5rem] lg:text-[1.6rem] font-bold">Settings</h1>
        <p className="text-muted text-[0.85rem] sm:text-[0.9rem] mt-1">Manage store information, hours, and delivery configuration.</p>
      </div>

      <div className="max-w-[680px] grid grid-cols-1 gap-5">

        {/* Store Information */}
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
          <div className={cardHeaderCls}>
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
              <i className="fa-solid fa-store text-green mr-2" />Store Information
            </h2>
          </div>
          <div className={cardBodyCls}>
            <SuccessMsg show={storeSuccess} msg="Store information saved!" />
            <form onSubmit={handleStoreSubmit}>
              <div className="mb-4">
                <label className={labelCls}>Business Name</label>
                <input type="text" value={storeForm.businessName} onChange={e => setStoreForm(f => ({ ...f, businessName: e.target.value }))} placeholder="e.g. JUDY'S Mini Hardware" className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Contact Number</label>
                <input type="text" value={storeForm.contactInfo} onChange={e => setStoreForm(f => ({ ...f, contactInfo: e.target.value }))} placeholder="+63 912 345 6789" className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Address</label>
                <textarea value={storeForm.address} onChange={e => setStoreForm(f => ({ ...f, address: e.target.value }))} placeholder="Full store address..." rows={3} className={`${inputCls} resize-y`} />
              </div>
              <button type="submit" className="bg-green text-white border-0 px-5 py-2.5 rounded-lg cursor-pointer text-[0.9rem] font-semibold hover:bg-growth transition-colors">
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
          <div className={cardHeaderCls}>
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
              <i className="fa-solid fa-clock text-green mr-2" />Business Hours
            </h2>
          </div>
          <div className={cardBodyCls}>
            <SuccessMsg show={hoursSuccess} msg="Business hours saved!" />
            <form onSubmit={handleHoursSubmit}>
              <div className="mb-4">
                <label className={labelCls}>Monday – Saturday</label>
                <input type="text" value={hoursForm.hoursWeekday} onChange={e => setHoursForm(f => ({ ...f, hoursWeekday: e.target.value }))} placeholder="e.g. 7:00 AM – 6:00 PM" className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Sunday</label>
                <input type="text" value={hoursForm.hoursSunday} onChange={e => setHoursForm(f => ({ ...f, hoursSunday: e.target.value }))} placeholder="e.g. 8:00 AM – 4:00 PM" className={inputCls} />
              </div>
              <div className="bg-[#fff8e1] border border-[#ffe082] rounded-lg px-3.5 py-2.5 text-[0.85rem] text-[#e65100] mb-4">
                <i className="fa-solid fa-triangle-exclamation mr-1.5" /> Note: No free delivery on Sundays.
              </div>
              <button type="submit" className="bg-green text-white border-0 px-5 py-2.5 rounded-lg cursor-pointer text-[0.9rem] font-semibold hover:bg-growth transition-colors">
                Save Hours
              </button>
            </form>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
          <div className={cardHeaderCls}>
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
              <i className="fa-solid fa-truck text-green mr-2" />Delivery Settings
            </h2>
          </div>
          <div className={cardBodyCls}>
            <SuccessMsg show={deliverySuccess} msg="Delivery settings saved!" />
            <form onSubmit={handleDeliverySubmit}>
              <div className="mb-4">
                <label className={labelCls}>Free Delivery Areas</label>
                <div className="bg-light rounded-lg px-3.5 py-3 text-[0.9rem]">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-circle-check text-green" />
                    <strong>Barangay Talisay</strong> — Gingoog City, Misamis Oriental
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-green" />
                    <strong>Barangay Pangasihan</strong> — Gingoog City, Misamis Oriental
                  </div>
                </div>
                <p className="text-[0.78rem] text-muted mt-1.5">These areas receive free delivery (Mon–Sat only).</p>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Delivery Fee for Other Areas (₱)</label>
                <input type="number" value={deliveryForm.deliveryFee} onChange={e => setDeliveryForm(f => ({ ...f, deliveryFee: e.target.value }))} placeholder="e.g. 80" min="0" step="1" className={inputCls} />
                <p className="text-[0.78rem] text-muted mt-1">Applied to all barangays outside the free delivery zones.</p>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Delivery Note (shown to customers)</label>
                <input type="text" value={deliveryForm.deliveryNote} onChange={e => setDeliveryForm(f => ({ ...f, deliveryNote: e.target.value }))} placeholder="e.g. Delivery fee applies for other areas" className={inputCls} />
              </div>
              <button type="submit" className="bg-green text-white border-0 px-5 py-2.5 rounded-lg cursor-pointer text-[0.9rem] font-semibold hover:bg-growth transition-colors">
                Save Delivery Settings
              </button>
            </form>
          </div>
        </div>

        {/* GCash Payment Settings */}
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
          <div className={cardHeaderCls}>
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
              <i className="fa-solid fa-mobile-screen-button text-[#0070ba] mr-2" />GCash Payment Settings
            </h2>
          </div>
          <div className={cardBodyCls}>
            <SuccessMsg show={gcashSuccess} msg="GCash settings saved!" />
            <form onSubmit={handleGcashSubmit}>
              <div className="mb-4">
                <label className={labelCls}>GCash Account Name</label>
                <input type="text" value={gcashForm.gcashName} onChange={e => setGcashForm(f => ({ ...f, gcashName: e.target.value }))} placeholder="e.g. Judy Hardware" className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>GCash Number</label>
                <input type="text" value={gcashForm.gcashNumber} onChange={e => setGcashForm(f => ({ ...f, gcashNumber: e.target.value }))} placeholder="e.g. 09XX XXX XXXX" className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Upload GCash QR Code Image</label>
                <input
                  ref={gcashFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGcashFile}
                  className="w-full px-2 py-2 border-2 border-dashed border-[#90caf9] rounded-lg cursor-pointer bg-[#f8fbff] text-[0.9rem]"
                />
                <p className="text-[0.78rem] text-muted mt-1">Upload a PNG or JPG of your GCash QR code. It will be shown to customers during checkout.</p>
              </div>
              {gcashForm.gcashQr && (
                <div className="mb-4 text-center">
                  <p className="text-[0.82rem] font-semibold text-forest mb-2">
                    <i className="fa-solid fa-qrcode mr-1" /> Current QR Code
                  </p>
                  <img
                    src={gcashForm.gcashQr}
                    alt="GCash QR Code"
                    className="w-40 h-40 object-contain border-2 border-[#90caf9] rounded-lg inline-block"
                  />
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={removeGcashQr}
                      className="bg-[#fce4ec] text-[#c62828] border-0 px-3 py-1.5 rounded-[6px] cursor-pointer text-[0.8rem] font-semibold hover:bg-[#f8bbd0] transition-colors"
                    >
                      <i className="fa-solid fa-trash mr-1" /> Remove QR Code
                    </button>
                  </div>
                </div>
              )}
              <button type="submit" className="bg-green text-white border-0 px-5 py-2.5 rounded-lg cursor-pointer text-[0.9rem] font-semibold hover:bg-growth transition-colors">
                <i className="fa-solid fa-floppy-disk mr-1.5" />Save GCash Settings
              </button>
            </form>
          </div>
        </div>

        {/* Admin Credentials */}
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
          <div className={cardHeaderCls}>
            <h2 className="text-forest font-bold text-base sm:text-[1.1rem]">
              <i className="fa-solid fa-lock text-green mr-2" />Admin Credentials
            </h2>
          </div>
          <div className={cardBodyCls}>
            <SuccessMsg show={credsSuccess} msg="Credentials updated!" />
            {credsError && (
              <div className="bg-[#fce4ec] text-[#c62828] rounded-lg px-3.5 py-2.5 text-[0.88rem] mb-4">
                {credsError}
              </div>
            )}
            <form onSubmit={handleCredsSubmit} noValidate>
              <div className="mb-4">
                <label className={labelCls}>Admin Username</label>
                <input type="text" value={credsForm.username} onChange={e => setCredsForm(f => ({ ...f, username: e.target.value }))} placeholder="admin" autoComplete="username" className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Current Password</label>
                <input type="password" value={credsForm.currentPassword} onChange={e => setCredsForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="Current password" autoComplete="current-password" className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>New Password</label>
                <input type="password" value={credsForm.newPassword} onChange={e => setCredsForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="New password (leave blank to keep)" autoComplete="new-password" className={inputCls} />
              </div>
              <button type="submit" className="bg-green text-white border-0 px-5 py-2.5 rounded-lg cursor-pointer text-[0.9rem] font-semibold hover:bg-growth transition-colors">
                Update Credentials
              </button>
            </form>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
