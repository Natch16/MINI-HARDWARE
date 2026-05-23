/**
 * contact.js — Inquiry form: Full Name, Contact Number, Message
 */

function validateInquiry(data) {
  return ['name', 'phone', 'message'].every(
    f => typeof data[f] === 'string' && data[f].trim().length > 0
  );
}

(function initContact() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  // Load store info
  const settings = Store.getSettings();
  const addrEl = document.getElementById('info-address');
  const contEl = document.getElementById('info-contact');
  const fcEl   = document.getElementById('footer-contact');
  if (addrEl) addrEl.textContent = settings.address     || 'P-7 Pangasihan, Gingoog City, Misamis Oriental';
  if (contEl) contEl.textContent = settings.contactInfo || 'Contact number to be provided';
  if (fcEl)   fcEl.textContent   = settings.contactInfo || '';

  // Pre-fill message from URL param (product inquiry)
  const params = new URLSearchParams(window.location.search);
  const product = params.get('product');
  if (product) {
    const msgEl = document.getElementById('inq-message');
    if (msgEl) msgEl.value = 'I would like to inquire about: ' + product;
  }

  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('visible', show);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('inq-name').value.trim();
    const phone   = document.getElementById('inq-phone').value.trim();
    const message = document.getElementById('inq-message').value.trim();

    // Validate — show inline errors
    showError('err-inq-name',    !name);
    showError('err-inq-phone',   !phone);
    showError('err-inq-message', !message);

    if (!name || !phone || !message) return;

    // Save inquiry to localStorage
    const inquiry = {
      id:        Store.generateId(),
      name,
      phone,
      // Keep email/subject for backward compat with admin view
      email:     '',
      subject:   'Customer Inquiry',
      message,
      read:      false,
      timestamp: new Date().toISOString(),
    };

    const inquiries = Store.getAll(Store.KEYS.INQUIRIES);
    Store.save(Store.KEYS.INQUIRIES, [...inquiries, inquiry]);

    // Reset and show success
    form.reset();
    success.classList.add('visible');
    setTimeout(() => success.classList.remove('visible'), 6000);
  });
})();
