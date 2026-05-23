/**
 * admin/inquiries.js — View, filter, and mark inquiries as read/unread
 */

function markInquiryRead(id) {
  const inquiries = Store.getAll(Store.KEYS.INQUIRIES);
  const updated = inquiries.map(i => i.id === id ? { ...i, read: true } : i);
  Store.save(Store.KEYS.INQUIRIES, updated);
}

function markInquiryUnread(id) {
  const inquiries = Store.getAll(Store.KEYS.INQUIRIES);
  const updated = inquiries.map(i => i.id === id ? { ...i, read: false } : i);
  Store.save(Store.KEYS.INQUIRIES, updated);
}

function deleteInquiry(id) {
  const inquiries = Store.getAll(Store.KEYS.INQUIRIES).filter(i => i.id !== id);
  Store.save(Store.KEYS.INQUIRIES, inquiries);
}

(function initAdminInquiries() {
  const list       = document.getElementById('inquiry-list');
  const detailCard = document.getElementById('inquiry-detail-card');
  const detailBody = document.getElementById('inquiry-detail-body');
  const unreadEl   = document.getElementById('unread-count');
  const closeBtn   = document.getElementById('close-detail');
  const filterBtns = document.querySelectorAll('[data-filter]');

  if (!list) return;

  let currentFilter = 'all';

  function renderList() {
    let inquiries = Store.getAll(Store.KEYS.INQUIRIES);
    const unread = inquiries.filter(i => !i.read).length;
    if (unreadEl) unreadEl.textContent = unread > 0 ? unread + ' unread' : 'All read';

    // Apply filter
    if (currentFilter === 'unread') inquiries = inquiries.filter(i => !i.read);
    if (currentFilter === 'read')   inquiries = inquiries.filter(i => i.read);

    // Sort: unread first, then newest
    inquiries = [...inquiries].sort((a, b) => {
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    if (inquiries.length === 0) {
      list.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">No messages found.</div>';
      return;
    }

    list.innerHTML = inquiries.map(i => `
      <div class="inquiry-item ${i.read ? '' : 'unread'}" data-id="${i.id}">
        <div class="inquiry-meta">
          <span class="inquiry-sender">
            ${!i.read ? '<span class="unread-dot"></span>' : ''}${i.name}
          </span>
          <span class="inquiry-time">${new Date(i.timestamp).toLocaleDateString()}</span>
        </div>
        ${i.phone ? `<div style="font-size:0.8rem;color:var(--hardware-green);font-weight:600;margin-bottom:3px;">📞 ${i.phone}</div>` : ''}
        <div class="inquiry-preview">${i.message}</div>
      </div>
    `).join('');

    list.querySelectorAll('.inquiry-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        markInquiryRead(id);
        renderList();
        showDetail(id);
      });
    });
  }

  function showDetail(id) {
    const inquiry = Store.getAll(Store.KEYS.INQUIRIES).find(i => i.id === id);
    if (!inquiry) return;

    detailCard.style.display = 'block';
    detailBody.innerHTML = `
      <div style="margin-bottom:14px;">
        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px;">Customer Name</p>
        <p style="font-weight:700;color:var(--deep-forest);font-size:1rem;">${inquiry.name}</p>
      </div>
      <div style="margin-bottom:14px;">
        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px;">Contact Number</p>
        <p style="font-weight:600;color:var(--hardware-green);font-size:0.95rem;">
          📞 ${inquiry.phone || '<span style="color:var(--text-muted);font-weight:400;">Not provided</span>'}
        </p>
      </div>
      ${inquiry.email ? `
      <div style="margin-bottom:14px;">
        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px;">Email</p>
        <p style="font-size:0.9rem;">${inquiry.email}</p>
      </div>` : ''}
      <div style="margin-bottom:14px;">
        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px;">Date Received</p>
        <p style="font-size:0.9rem;">${new Date(inquiry.timestamp).toLocaleString()}</p>
      </div>
      <div style="margin-bottom:16px;">
        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:8px;">Message</p>
        <div style="background:var(--light-gray);padding:16px;border-radius:var(--radius);line-height:1.8;white-space:pre-wrap;font-size:0.9rem;">${inquiry.message}</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        ${inquiry.read
          ? `<button class="btn btn-sm btn-outline" onclick="markInquiryUnread('${inquiry.id}');document.getElementById('inquiry-detail-card').style.display='none';initAdminInquiries();">Mark as Unread</button>`
          : `<button class="btn btn-sm" onclick="markInquiryRead('${inquiry.id}');document.getElementById('inquiry-detail-card').style.display='none';initAdminInquiries();">Mark as Read</button>`
        }
        <button class="btn-delete" style="padding:8px 16px;border-radius:var(--radius);" onclick="if(confirm('Delete this inquiry?')){deleteInquiry('${inquiry.id}');document.getElementById('inquiry-detail-card').style.display='none';initAdminInquiries();}">Delete</button>
      </div>
    `;
  }

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderList();
    });
  });

  closeBtn.addEventListener('click', () => {
    detailCard.style.display = 'none';
  });

  renderList();

  // Re-expose for inline onclick handlers
  window.initAdminInquiries = function() {
    renderList();
  };
})();
