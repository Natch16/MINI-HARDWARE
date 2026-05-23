import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { authController, orderController } from '../controllers/userController.js';
import LogoutConfirmModal from '../components/LogoutConfirmModal.jsx';

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [showLogout, setShowLogout] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameGenError, setNameGenError] = useState('');

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [pwGenError, setPwGenError] = useState('');

  useEffect(() => {
    if (!authController.isLoggedIn()) {
      navigate('/login?next=/account');
      return;
    }
    const currentUser = authController.currentUser();
    setUser(currentUser);
    setEditName(currentUser.name);
    loadOrders(currentUser.id);

    const isNew = sessionStorage.getItem('jh_new_user') === '1';
    if (isNew) {
      setShowWelcome(true);
      sessionStorage.removeItem('jh_new_user');
    }
  }, []);

  function loadOrders(userId) {
    const userOrders = orderController.getByUser(userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(userOrders);
  }

  function handleCancelOrder(orderId) {
    if (!window.confirm('Cancel this order?')) return;
    const result = orderController.cancel(orderId);
    if (result.ok) {
      loadOrders(user.id);
    } else {
      alert(result.error);
    }
  }

  function handleSaveName(e) {
    e.preventDefault();
    setNameError('');
    setNameGenError('');
    if (!editName.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    const result = authController.updateProfile({ name: editName.trim() });
    if (!result.ok) {
      setNameGenError(result.error);
      return;
    }
    setUser(result.user);
    setNameSuccess(true);
    setTimeout(() => setNameSuccess(false), 3000);
  }

  function handleChangePassword(e) {
    e.preventDefault();
    const errs = {};
    if (!currentPw) errs.currentPw = 'Current password is required.';
    if (newPw.length < 6) errs.newPw = 'New password must be at least 6 characters.';
    if (newPw !== confirmPw) errs.confirmPw = 'Passwords do not match.';
    setPwErrors(errs);
    setPwGenError('');
    if (Object.keys(errs).length > 0) return;

    const result = authController.updateProfile({ currentPassword: currentPw, newPassword: newPw });
    if (!result.ok) {
      setPwGenError(result.error);
      return;
    }
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 3000);
  }

  function handleLogout() {
    authController.logout();
    navigate('/login');
  }

  if (!user) return null;

  const orderCount = orders.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-forest text-white py-8 sm:py-10 md:py-12 text-center">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <h1 className="text-white" style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)' }}>My Account</h1>
            <p className="text-white/80 mt-2 text-[0.95rem] sm:text-base">
              Manage your profile and view your orders
            </p>
          </div>
        </div>

        <section>
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-8 py-8">

              {/* Sidebar */}
              <aside className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden h-fit">
                <div className="bg-forest px-5 py-5">
                  <h3 className="text-white font-bold text-base mb-0.5">{user.name}</h3>
                  <p className="text-white/70 text-[0.82rem]">{user.email}</p>
                </div>
                <nav>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2.5 w-full px-5 py-3.5 text-[0.9rem] font-medium border-b border-[#f0f0f0] transition-colors text-left ${
                      activeTab === 'orders' ? 'bg-[#f0faf0] text-green' : 'text-dark hover:bg-[#f0faf0] hover:text-green'
                    }`}
                  >
                    <i className="fa-solid fa-box-open text-[1.1rem]" />
                    My Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2.5 w-full px-5 py-3.5 text-[0.9rem] font-medium border-b border-[#f0f0f0] transition-colors text-left ${
                      activeTab === 'profile' ? 'bg-[#f0faf0] text-green' : 'text-dark hover:bg-[#f0faf0] hover:text-green'
                    }`}
                  >
                    <i className="fa-solid fa-circle-user text-[1.1rem]" />
                    Profile
                  </button>
                  <Link
                    to="/products"
                    className="flex items-center gap-2.5 w-full px-5 py-3.5 text-[0.9rem] font-medium border-b border-[#f0f0f0] text-dark hover:bg-[#f0faf0] hover:text-green transition-colors"
                  >
                    <i className="fa-solid fa-cart-shopping text-[1.1rem]" />
                    Browse Products
                  </Link>
                  <button
                    onClick={() => setShowLogout(true)}
                    className="flex items-center gap-2.5 w-full px-5 py-3.5 text-[0.9rem] font-medium text-[#ef5350] hover:bg-[#fce4ec] transition-colors text-left"
                  >
                    <i className="fa-solid fa-right-from-bracket text-[1.1rem]" />
                    Sign Out
                  </button>
                </nav>
              </aside>

              {/* Main Content */}
              <div className="flex flex-col gap-5">

                {/* Welcome Banner */}
                {showWelcome && (
                  <div className="bg-gradient-to-br from-forest to-green rounded-lg p-6 text-white">
                    <h2 className="text-white text-[1.3rem] font-bold mb-1.5">
                      <i className="fa-solid fa-party-horn mr-1.5" />
                      Welcome to JUDY&apos;S Hardware!
                    </h2>
                    <p className="text-white/90 mb-4 text-[0.95rem]">
                      Your account is ready. Browse our products and place your first order — free delivery to Talisay &amp; Pangasihan!
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      <Link
                        to="/products"
                        className="inline-block bg-white text-forest px-4 py-2 rounded-lg font-semibold text-sm hover:bg-light transition-colors"
                      >
                        <i className="fa-solid fa-cart-shopping mr-1.5" />
                        Start Shopping
                      </Link>
                      <button
                        onClick={() => setShowWelcome(false)}
                        className="bg-transparent border-2 border-white/50 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#eee] flex items-center justify-between flex-wrap gap-2">
                      <h2 className="text-forest text-[1.1rem] font-bold">
                        <i className="fa-solid fa-box-open text-green mr-1.5" />
                        My Orders
                      </h2>
                      <Link
                        to="/products"
                        className="bg-green text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-growth transition-colors"
                      >
                        + New Order
                      </Link>
                    </div>
                    <div className="p-5">
                      {orders.length === 0 ? (
                        <div className="text-center py-10 sm:py-16 text-muted">
                          <div className="text-[2.5rem] sm:text-[3rem] mb-3 sm:mb-4">
                            <i className="fa-solid fa-box-open text-muted" />
                          </div>
                          <p>You haven&apos;t placed any orders yet.</p>
                          <Link
                            to="/products"
                            className="inline-block mt-4 bg-green text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-growth transition-colors"
                          >
                            Browse Products
                          </Link>
                        </div>
                      ) : (
                        orders.map(order => (
                          <div
                            key={order.id}
                            className="border border-[#eee] rounded-lg p-4 mb-3 last:mb-0 hover:shadow-[0_2px_12px_rgba(0,0,0,0.10)] transition-shadow"
                          >
                            <div className="flex justify-between items-start flex-wrap gap-2 mb-2.5">
                              <div className="font-bold text-forest text-[0.95rem]">{order.productName}</div>
                              <span
                                className="text-[0.78rem] font-bold px-2.5 py-0.5 rounded-xl bg-[#f5f5f5]"
                                style={{ color: orderController.statusColor(order.status) }}
                              >
                                {orderController.statusLabel(order.status)}
                              </span>
                            </div>
                            <div className="text-[0.82rem] text-muted flex flex-wrap gap-3">
                              <span>Qty: {order.quantity}</span>
                              <span>📍 {order.barangay}{order.address ? `, ${order.address}` : ''}</span>
                              <span>🚚 Delivery: {order.deliveryFree ? 'FREE' : `₱${order.deliveryFee}`}</span>
                              <span>🕐 {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            {order.notes && (
                              <p className="text-[0.82rem] text-muted mt-1.5">Note: {order.notes}</p>
                            )}
                            <div className="font-bold text-green text-[0.95rem] mt-2">
                              Total: ₱{order.totalPrice.toLocaleString()}
                            </div>
                            {order.status === 'pending' && (
                              <div className="mt-3">
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="bg-[#fce4ec] text-[#c62828] border-0 px-3.5 py-1.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#f8bbd0] transition-colors"
                                >
                                  Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#eee]">
                      <h2 className="text-forest text-[1.1rem] font-bold">
                        <i className="fa-solid fa-circle-user text-green mr-1.5" />
                        Profile
                      </h2>
                    </div>
                    <div className="p-5">
                      {/* Profile info */}
                      <div className="mb-7">
                        {[
                          { label: 'Name', value: user.name },
                          { label: 'Email', value: user.email },
                          { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString() },
                          { label: 'Orders', value: `${orderCount} total` },
                        ].map(row => (
                          <div
                            key={row.label}
                            className="flex gap-3 items-start py-2.5 border-b border-[#f5f5f5] last:border-b-0 text-[0.9rem]"
                          >
                            <span className="text-muted min-w-[100px] text-[0.82rem] font-semibold uppercase tracking-[0.3px]">
                              {row.label}
                            </span>
                            <span className="text-dark font-medium">{row.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Edit Name */}
                      <div className="border-t border-[#eee] pt-5 mb-5">
                        <h3 className="text-forest text-base font-bold mb-3.5">
                          <i className="fa-solid fa-pen mr-1.5" />
                          Edit Name
                        </h3>
                        {nameSuccess && (
                          <div className="bg-[#e8f5e9] border border-green text-forest px-3.5 py-2.5 rounded-lg text-[0.92rem] mb-4">
                            ✅ Name updated successfully!
                          </div>
                        )}
                        <form onSubmit={handleSaveName} noValidate>
                          <div className="mb-4">
                            <label className="block font-semibold text-forest text-[0.88rem] sm:text-[0.9rem] mb-1.5">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              placeholder="Your full name"
                              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base focus:outline-none focus:border-green transition-colors"
                            />
                            {nameError && (
                              <p className="text-[#cc0000] text-[0.8rem] mt-1">{nameError}</p>
                            )}
                          </div>
                          {nameGenError && (
                            <p className="text-[#cc0000] text-[0.9rem] mb-2.5">{nameGenError}</p>
                          )}
                          <button
                            type="submit"
                            className="bg-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-growth transition-colors cursor-pointer border-0"
                          >
                            Save Name
                          </button>
                        </form>
                      </div>

                      {/* Change Password */}
                      <div className="border-t border-[#eee] pt-5">
                        <h3 className="text-forest text-base font-bold mb-3.5">
                          <i className="fa-solid fa-lock mr-1.5" />
                          Change Password
                        </h3>
                        {pwSuccess && (
                          <div className="bg-[#e8f5e9] border border-green text-forest px-3.5 py-2.5 rounded-lg text-[0.92rem] mb-4">
                            ✅ Password changed successfully!
                          </div>
                        )}
                        <form onSubmit={handleChangePassword} noValidate>
                          <div className="mb-4">
                            <label className="block font-semibold text-forest text-[0.88rem] sm:text-[0.9rem] mb-1.5">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={currentPw}
                              onChange={e => setCurrentPw(e.target.value)}
                              placeholder="Your current password"
                              autoComplete="current-password"
                              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base focus:outline-none focus:border-green transition-colors"
                            />
                            {pwErrors.currentPw && (
                              <p className="text-[#cc0000] text-[0.8rem] mt-1">{pwErrors.currentPw}</p>
                            )}
                          </div>
                          <div className="mb-4">
                            <label className="block font-semibold text-forest text-[0.88rem] sm:text-[0.9rem] mb-1.5">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={newPw}
                              onChange={e => setNewPw(e.target.value)}
                              placeholder="At least 6 characters"
                              autoComplete="new-password"
                              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base focus:outline-none focus:border-green transition-colors"
                            />
                            {pwErrors.newPw && (
                              <p className="text-[#cc0000] text-[0.8rem] mt-1">{pwErrors.newPw}</p>
                            )}
                          </div>
                          <div className="mb-4">
                            <label className="block font-semibold text-forest text-[0.88rem] sm:text-[0.9rem] mb-1.5">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={confirmPw}
                              onChange={e => setConfirmPw(e.target.value)}
                              placeholder="Repeat new password"
                              autoComplete="new-password"
                              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base focus:outline-none focus:border-green transition-colors"
                            />
                            {pwErrors.confirmPw && (
                              <p className="text-[#cc0000] text-[0.8rem] mt-1">{pwErrors.confirmPw}</p>
                            )}
                          </div>
                          {pwGenError && (
                            <p className="text-[#cc0000] text-[0.9rem] mb-2.5">{pwGenError}</p>
                          )}
                          <button
                            type="submit"
                            className="bg-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-growth transition-colors cursor-pointer border-0"
                          >
                            Change Password
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LogoutConfirmModal
        open={showLogout}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
}
