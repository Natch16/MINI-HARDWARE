/**
 * admin/payments.js — Payment verification UI
 * Requirements: 15.1–15.6, 16.1, 16.3, 16.4
 */

(function initAdminPayments() {
  var currentFilter = 'all';

  // ── Lightbox ──────────────────────────────────────────────────────────────
  var lightbox     = document.getElementById('proof-lightbox');
  var lightboxImg  = document.getElementById('proof-lightbox-img');
  var lightboxClose = document.getElementById('proof-lightbox-close');

  if (lightboxClose) {
    lightboxClose.addEventListener('click', function() { lightbox.classList.remove('open'); });
  }
  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) lightbox.classList.remove('open');
    });
  }

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmtDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  }

  function fmtAmount(n) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function statusBadge(status) {
    var labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
    return '<span class="pay-status ' + status + '">' + (labels[status] || status) + '</span>';
  }

  function deliveryChip(order) {
    if (!order) return '—';
    if (order.deliveryFree) {
      return '<span class="delivery-chip free"><i class="fa-solid fa-circle-check"></i> FREE</span>';
    }
    return '<span class="delivery-chip paid"><i class="fa-solid fa-truck"></i> ₱' + order.deliveryFee + '</span>';
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  function updateStats(payments) {
    var pending  = payments.filter(function(p) { return p.status === 'pending'; }).length;
    var approved = payments.filter(function(p) { return p.status === 'approved'; }).length;
    var rejected = payments.filter(function(p) { return p.status === 'rejected'; }).length;
    var sp = document.getElementById('stat-pending');
    var sa = document.getElementById('stat-approved');
    var sr = document.getElementById('stat-rejected');
    if (sp) sp.textContent = pending;
    if (sa) sa.textContent = approved;
    if (sr) sr.textContent = rejected;
  }

  // ── Render table ──────────────────────────────────────────────────────────
  function render() {
    var tbody = document.getElementById('payments-tbody');
    if (!tbody) return;

    var allPayments = Payment.getAll();
    updateStats(allPayments);

    var payments = currentFilter === 'all'
      ? allPayments
      : allPayments.filter(function(p) { return p.status === currentFilter; });

    // Sort newest first
    payments = payments.slice().sort(function(a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted);">'
        + '<i class="fa-solid fa-inbox" style="font-size:1.5rem;display:block;margin-bottom:8px;"></i>'
        + 'No payments found.</td></tr>';
      return;
    }

    var orders = Orders.getAll();

    tbody.innerHTML = payments.map(function(pay) {
      var order = orders.find(function(o) { return o.id === pay.orderId; }) || null;
      var barangay = order ? order.barangay : '—';

      // Receipt thumbnail
      var thumbHtml = pay.proofImage
        ? '<img src="' + pay.proofImage + '" class="proof-thumb" data-pay-id="' + pay.id + '" alt="Receipt" />'
        : '<span style="color:var(--text-muted);font-size:0.78rem;">Cash</span>';

      // Action buttons
      var actionHtml = '';
      if (pay.status === 'pending') {
        actionHtml = '<div style="display:flex;gap:6px;flex-wrap:wrap;">'
          + '<button class="btn-approve" data-pay-id="' + pay.id + '">✔ Approve</button>'
          + '<button class="btn-reject"  data-pay-id="' + pay.id + '">✘ Reject</button>'
          + '</div>';
      } else if (pay.status === 'approved') {
        // Show Confirm Delivery if order not yet confirmed
        var orderStatus = order ? order.status : '';
        if (orderStatus !== 'confirmed') {
          actionHtml = '<button class="btn-confirm-delivery" data-order-id="' + (order ? order.id : '') + '">'
            + '<i class="fa-solid fa-truck"></i> Confirm Delivery</button>';
        } else {
          actionHtml = '<span style="color:#1b5e20;font-size:0.78rem;font-weight:700;">'
            + '<i class="fa-solid fa-circle-check"></i> Delivered</span>';
        }
      } else {
        actionHtml = '<span style="color:var(--text-muted);font-size:0.78rem;">—</span>';
      }

      return '<tr>'
        + '<td>' + thumbHtml + '</td>'
        + '<td>'
        +   '<div style="font-weight:700;color:var(--deep-forest);font-size:0.88rem;">' + (pay.userName || '—') + '</div>'
        +   '<div style="font-size:0.75rem;color:var(--text-muted);">' + (pay.userEmail || '') + '</div>'
        + '</td>'
        + '<td class="col-hide-mobile">'
        +   '<div style="font-size:0.88rem;">' + (pay.productName || '—') + '</div>'
        +   '<div style="font-size:0.72rem;color:var(--text-muted);">Barangay: ' + barangay + '</div>'
        + '</td>'
        + '<td style="font-weight:700;color:var(--deep-forest);">' + fmtAmount(pay.amountPaid) + '</td>'
        + '<td class="col-hide-mobile">' + deliveryChip(order) + '</td>'
        + '<td>'
        +   '<span style="font-size:0.82rem;font-weight:600;text-transform:capitalize;">'
        +   (pay.paymentMethod === 'gcash'
              ? '<i class="fa-solid fa-mobile-screen-button" style="color:#0070ba;margin-right:3px;"></i>GCash'
              : '<i class="fa-solid fa-money-bill-wave" style="color:#1b5e20;margin-right:3px;"></i>Cash')
        +   '</span>'
        + '</td>'
        + '<td>' + statusBadge(pay.status) + '</td>'
        + '<td class="col-hide-mobile" style="font-size:0.78rem;color:var(--text-muted);">' + fmtDate(pay.createdAt) + '</td>'
        + '<td>' + actionHtml + '</td>'
        + '</tr>';
    }).join('');

    // Bind proof thumbnail clicks
    tbody.querySelectorAll('.proof-thumb').forEach(function(img) {
      img.addEventListener('click', function() { openLightbox(img.src); });
    });

    // Bind approve buttons
    tbody.querySelectorAll('.btn-approve').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var payId = btn.getAttribute('data-pay-id');
        if (confirm('Approve this payment?')) {
          Payment.review(payId, 'approved');
          render();
        }
      });
    });

    // Bind reject buttons
    tbody.querySelectorAll('.btn-reject').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var payId = btn.getAttribute('data-pay-id');
        if (confirm('Reject this payment?')) {
          Payment.review(payId, 'rejected');
          render();
        }
      });
    });

    // Bind confirm delivery buttons
    tbody.querySelectorAll('.btn-confirm-delivery').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var orderId = btn.getAttribute('data-order-id');
        if (orderId && confirm('Confirm delivery for this order?')) {
          Orders.updateStatus(orderId, 'confirmed');
          render();
        }
      });
    });
  }

  // ── Filter tabs ───────────────────────────────────────────────────────────
  document.querySelectorAll('.filter-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      render();
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  render();
})();
