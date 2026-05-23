/**
 * admin/settings.js — Store info, hours, delivery, and credentials forms
 */
(function initSettings() {

  // ── Store Information ──────────────────────────────────────────────────
  var storeForm = document.getElementById('store-form');
  if (storeForm) {
    var settings = Store.getSettings();
    document.getElementById('s-name').value    = settings.businessName || '';
    document.getElementById('s-contact').value = settings.contactInfo  || '';
    document.getElementById('s-address').value = settings.address      || '';

    storeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var updated = Object.assign({}, Store.getSettings(), {
        businessName: document.getElementById('s-name').value.trim(),
        contactInfo:  document.getElementById('s-contact').value.trim(),
        address:      document.getElementById('s-address').value.trim(),
      });
      Store.saveSettings(updated);
      showSuccess('store-success');
    });
  }

  // ── Business Hours ─────────────────────────────────────────────────────
  var hoursForm = document.getElementById('hours-form');
  if (hoursForm) {
    var s = Store.getSettings();
    document.getElementById('h-weekday').value = s.hoursWeekday || 'Monday – Saturday: 7:00 AM – 6:00 PM';
    document.getElementById('h-sunday').value  = s.hoursSunday  || 'Sunday: 8:00 AM – 4:00 PM';

    hoursForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var updated = Object.assign({}, Store.getSettings(), {
        hoursWeekday: document.getElementById('h-weekday').value.trim(),
        hoursSunday:  document.getElementById('h-sunday').value.trim(),
      });
      Store.saveSettings(updated);
      showSuccess('hours-success');
    });
  }

  // ── Delivery Settings ──────────────────────────────────────────────────
  var deliveryForm = document.getElementById('delivery-form');
  if (deliveryForm) {
    var ds = Store.getSettings();
    document.getElementById('d-fee').value  = ds.deliveryFee  !== undefined ? ds.deliveryFee  : 80;
    document.getElementById('d-note').value = ds.deliveryNote || 'Delivery fee applies for other areas';

    deliveryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var fee = parseInt(document.getElementById('d-fee').value, 10);
      var updated = Object.assign({}, Store.getSettings(), {
        deliveryFee:  isNaN(fee) ? 80 : fee,
        deliveryNote: document.getElementById('d-note').value.trim(),
      });
      Store.saveSettings(updated);
      showSuccess('delivery-success');
    });
  }

  // ── Admin Credentials ──────────────────────────────────────────────────
  var credsForm = document.getElementById('creds-form');
  if (credsForm) {
    var CREDS_KEY = 'jh_admin_creds';

    function getCurrentCreds() {
      try {
        var raw = localStorage.getItem(CREDS_KEY);
        return raw ? JSON.parse(raw) : { username: 'admin', password: 'admin123' };
      } catch (e) {
        return { username: 'admin', password: 'admin123' };
      }
    }

    var creds = getCurrentCreds();
    document.getElementById('c-username').value = creds.username;

    credsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var currentPw = document.getElementById('c-current-pw').value;
      var newPw     = document.getElementById('c-new-pw').value;
      var newUser   = document.getElementById('c-username').value.trim();
      var genErr    = document.getElementById('err-creds-general');
      var pwErr     = document.getElementById('err-current-pw');

      genErr.style.display = 'none';
      pwErr.classList.remove('visible');

      var existing = getCurrentCreds();
      if (currentPw !== existing.password) {
        pwErr.classList.add('visible');
        return;
      }
      if (!newUser) {
        genErr.style.display = 'block';
        genErr.textContent = 'Username cannot be empty.';
        return;
      }

      var updated = {
        username: newUser,
        password: newPw && newPw.length >= 6 ? newPw : existing.password,
      };
      localStorage.setItem(CREDS_KEY, JSON.stringify(updated));
      document.getElementById('c-current-pw').value = '';
      document.getElementById('c-new-pw').value = '';
      showSuccess('creds-success');
    });
  }

  // ── GCash Payment Settings ─────────────────────────────────────────────
  var gcashForm = document.getElementById('gcash-form');
  if (gcashForm) {
    var gcashCfg = (typeof Payment !== 'undefined') ? Payment.getGcashConfig() : { name: '', number: '', qrSrc: '' };
    document.getElementById('g-name').value   = gcashCfg.name   || '';
    document.getElementById('g-number').value = gcashCfg.number || '';

    function updateQrPreview(src) {
      var preview = document.getElementById('gcash-qr-preview');
      var img     = document.getElementById('gcash-qr-img');
      if (src) {
        img.src = src;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
        img.src = '';
      }
    }
    updateQrPreview(gcashCfg.qrSrc || '');

    // Preview on file select
    document.getElementById('g-qr').addEventListener('change', function() {
      var file = this.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) { updateQrPreview(ev.target.result); };
      reader.readAsDataURL(file);
    });

    // Remove QR
    document.getElementById('gcash-qr-remove').addEventListener('click', function() {
      document.getElementById('g-qr').value = '';
      updateQrPreview('');
      var cfg = (typeof Payment !== 'undefined') ? Payment.getGcashConfig() : {};
      cfg.qrSrc = '';
      if (typeof Payment !== 'undefined') Payment.saveGcashConfig(cfg);
      showSuccess('gcash-success');
    });

    gcashForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name   = document.getElementById('g-name').value.trim();
      var number = document.getElementById('g-number').value.trim();
      var qrFile = document.getElementById('g-qr').files[0];

      function save(qrSrc) {
        var cfg = { name: name, number: number, qrSrc: qrSrc };
        if (typeof Payment !== 'undefined') Payment.saveGcashConfig(cfg);
        updateQrPreview(qrSrc);
        showSuccess('gcash-success');
      }

      if (qrFile) {
        var reader = new FileReader();
        reader.onload = function(ev) { save(ev.target.result); };
        reader.readAsDataURL(qrFile);
      } else {
        // Keep existing QR if no new file selected
        var existing = (typeof Payment !== 'undefined') ? Payment.getGcashConfig() : {};
        save(existing.qrSrc || '');
      }
    });
  }

  // ── Helper ─────────────────────────────────────────────────────────────
  function showSuccess(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('visible');
    setTimeout(function() { el.classList.remove('visible'); }, 3000);
  }

})();
