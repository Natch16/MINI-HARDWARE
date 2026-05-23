/**
 * dashboard.js — Admin dashboard metrics and rendering
 */
function getDashboardMetrics() {
  var products   = Store.getAll(Store.KEYS.PRODUCTS);
  var orders     = Store.getAll(Store.KEYS.ORDERS);
  var inquiries  = Store.getAll(Store.KEYS.INQUIRIES);
  var categories = Store.getAll(Store.KEYS.CATEGORIES);

  var availableStock = products.filter(function(p) { return p.available; }).length;
  var totalOrders    = orders.length;
  var pendingOrders  = orders.filter(function(o) { return o.status === 'pending'; }).length;
  var unreadMsgs     = inquiries.filter(function(i) { return !i.read; }).length;

  // Sales summary: sum of totalPrice for confirmed orders
  var totalSales = orders
    .filter(function(o) { return o.status === 'confirmed'; })
    .reduce(function(sum, o) { return sum + (Number(o.totalPrice) || 0); }, 0);

  return {
    products:       products.length,
    categories:     categories.length,
    availableStock: availableStock,
    totalOrders:    totalOrders,
    pendingOrders:  pendingOrders,
    unreadMsgs:     unreadMsgs,
    totalSales:     totalSales,
  };
}

(function initDashboard() {
  var m = getDashboardMetrics();

  function set(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  set('count-products',    m.products);
  set('count-categories',  m.categories);
  set('count-available',   m.availableStock);
  set('count-orders',      m.totalOrders);
  set('count-pending',     m.pendingOrders);
  set('count-messages',    m.unreadMsgs);
  set('count-sales',       '₱' + m.totalSales.toLocaleString());

  // Notification badge
  var badge = document.getElementById('notif-badge');
  var total = m.unreadMsgs + m.pendingOrders;
  if (badge) {
    badge.textContent = total > 0 ? total : '';
    badge.style.display = total > 0 ? 'flex' : 'none';
  }

  // Recent orders table
  var tbody = document.getElementById('recent-orders-tbody');
  if (tbody) {
    var orders = Store.getAll(Store.KEYS.ORDERS)
      .sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
      .slice(0, 5);

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">No orders yet.</td></tr>';
    } else {
      tbody.innerHTML = orders.map(function(o) {
        var statusColors = { pending: '#e65100', confirmed: '#1b5e20', cancelled: '#555' };
        var statusLabels = { pending: '⏳ Pending', confirmed: '✅ Confirmed', cancelled: '❌ Cancelled' };
        return '<tr>'
          + '<td><strong>' + o.userName + '</strong><br><span style="font-size:0.75rem;color:var(--text-muted);">' + o.userEmail + '</span></td>'
          + '<td>' + o.productName + '</td>'
          + '<td>₱' + Number(o.totalPrice).toLocaleString() + '</td>'
          + '<td><span style="font-weight:700;color:' + (statusColors[o.status] || '#333') + '">' + (statusLabels[o.status] || o.status) + '</span></td>'
          + '<td style="font-size:0.78rem;color:var(--text-muted);">' + new Date(o.createdAt).toLocaleDateString() + '</td>'
          + '</tr>';
      }).join('');
    }
  }
})();
