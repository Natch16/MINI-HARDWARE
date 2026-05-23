/**
 * buy-now.js — Shared "Buy Now" flow used on products listing and home page.
 *
 * Matches the full product-detail.js order flow:
 *  - Guest → auth prompt (Sign In / Create Account)
 *  - Logged-in → full order modal with qty, barangay, delivery preview,
 *                payment method (Cash / GCash), GCash details + QR code,
 *                proof image upload, and confirmation message
 */

(function initBuyNow() {
  // ── Inject shared CSS once ───────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#bn-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:3000;align-items:center;justify-content:center;padding:16px;}',
    '#bn-overlay.open{display:flex;}',
    '#bn-box{background:#fff;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.22);width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding:24px;}',
    '#bn-box h2{color:var(--deep-forest);font-size:1.15rem;margin-bottom:6px;}',
    '#bn-box .bn-sub{color:var(--text-muted);font-size:0.88rem;margin-bottom:18px;}',
    '.bn-auth-btns{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;}',
    '.bn-auth-btns a{flex:1;text-align:center;}',
    '#bn-fee-preview{background:var(--light-gray);border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:0.88rem;display:none;}',
    '#bn-success{display:none;background:#e8f5e9;border:1px solid var(--hardware-green);color:var(--deep-forest);padding:14px 16px;border-radius:8px;margin-bottom:16px;font-size:0.92rem;}',
    '.bn-close{float:right;background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--text-muted);line-height:1;padding:0;}',
    '.bn-form-error{color:#cc0000;font-size:0.8rem;margin-top:2px;display:none;}',
    '.bn-form-error.visible{display:block;}',
    // QR zoom lightbox
    '#qr-lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:9999;align-items:center;justify-content:center;padding:20px;cursor:zoom-out;}',
    '#qr-lightbox.open{display:flex;}',
    '#qr-lightbox img{max-width:min(90vw,420px);max-height:min(90vh,420px);border-radius:12px;box-shadow:0 8px 48px rgba(0,0,0,0.6);animation:qrZoomIn 0.22s ease;}',
    '@keyframes qrZoomIn{from{transform:scale(0.7);opacity:0;}to{transform:scale(1);opacity:1;}}',
    '#qr-lightbox-hint{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.7);font-size:0.82rem;pointer-events:none;}',
    '.qr-zoomable{cursor:zoom-in;transition:transform 0.15s,box-shadow 0.15s;}',
    '.qr-zoomable:hover{transform:scale(1.06);box-shadow:0 4px 20px rgba(0,112,186,0.4);}',
  ].join('');
  document.head.appendChild(style);

  // ── QR Lightbox (shared, injected once) ──────────────────────────────────
  if (!document.getElementById('qr-lightbox')) {
    var lb = document.createElement('div');
    lb.id = 'qr-lightbox';
    lb.innerHTML = '<img id="qr-lightbox-img" src="" alt="GCash QR Code" />'
      + '<span id="qr-lightbox-hint">Tap anywhere to close</span>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function() { lb.classList.remove('open'); });
  }

  window.QRLightbox = {
    open: function(src) {
      var lb = document.getElementById('qr-lightbox');
      var img = document.getElementById('qr-lightbox-img');
      if (!lb || !img) return;
      img.src = src;
      lb.classList.add('open');
    }
  };

  // ── Build overlay DOM ────────────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'bn-overlay';
  overlay.innerHTML = '<div id="bn-box"></div>';
  document.body.appendChild(overlay);

  var box = document.getElementById('bn-box');

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeOverlay();
  });

  function closeOverlay() {
    overlay.classList.remove('open');
    box.innerHTML = '';
  }

  // ── Guest prompt ─────────────────────────────────────────────────────────
  function showGuestPrompt(product) {
    var returnUrl = 'product-detail.html?id=' + product.id;
    box.innerHTML = '<button class="bn-close" id="bn-close-btn" aria-label="Close">&times;</button>'
      + '<h2>&#128274; Sign in to Buy</h2>'
      + '<p class="bn-sub">You need an account to place an order for <strong>' + product.name + '</strong>. It only takes a minute to get started.</p>'
      + '<div class="bn-auth-btns">'
      + '<a href="login.html?next=' + encodeURIComponent(returnUrl) + '" class="btn">Sign In</a>'
      + '<a href="register.html" class="btn btn-outline">Create Account</a>'
      + '</div>'
      + '<p style="font-size:0.78rem;color:var(--text-muted);text-align:center;">Already have an account? Sign in to continue.</p>';
    overlay.classList.add('open');
    document.getElementById('bn-close-btn').addEventListener('click', closeOverlay);
  }

  // ── Full order modal (logged-in) — mirrors product-detail.js ─────────────
  function showOrderModal(product) {
    // Load dynamic GCash config
    var gcash = (typeof Payment !== 'undefined') ? Payment.getGcashConfig() : { name: 'Judy Hardware', number: '09XX XXX XXXX', qrSrc: '' };
    var gcashName   = gcash.name   || 'Judy Hardware';
    var gcashNumber = gcash.number || '09XX XXX XXXX';
    var gcashQrSrc  = gcash.qrSrc  || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png';
    var qrHtml = '<img src="' + gcashQrSrc + '" alt="GCash QR Code" class="qr-zoomable" id="bn-qr-img" style="width:110px;height:110px;border-radius:8px;border:2px solid #90caf9;display:block;object-fit:contain;" />';

    box.innerHTML = [
      '<button class="bn-close" id="bn-close-btn" aria-label="Close">&times;</button>',
      '<h2><i class="fa-solid fa-cart-shopping" style="margin-right:6px;"></i>Buy Now</h2>',
      '<p class="bn-sub"><strong>' + product.name + '</strong> &mdash; &#8369;' + Number(product.price).toLocaleString() + ' each</p>',

      // Success
      '<div id="bn-success">',
      '<p style="font-weight:700;margin-bottom:6px;"><i class="fa-solid fa-circle-check"></i> Order placed successfully!</p>',
      '<p id="bn-success-msg" style="font-size:0.88rem;"></p>',
      '</div>',

      '<form id="bn-form" novalidate>',

      // Qty
      '<div class="form-group"><label for="bn-qty">Quantity</label>',
      '<input type="number" id="bn-qty" value="1" min="1" max="100" />',
      '<span class="bn-form-error" id="bn-err-qty">Enter a valid quantity.</span></div>',

      // Barangay
      '<div class="form-group"><label for="bn-barangay">Barangay *</label>',
      '<input type="text" id="bn-barangay" placeholder="e.g. Talisay, Pangasihan..." />',
      '<span class="bn-form-error" id="bn-err-barangay">Barangay is required.</span></div>',
      '<p style="font-size:0.78rem;color:var(--text-muted);margin:-8px 0 12px;">Free delivery: <strong>Talisay</strong> &amp; <strong>Pangasihan</strong> &bull; <span style="color:#c62828;font-weight:600;">No free delivery on Sundays</span></p>',

      // Address
      '<div class="form-group"><label for="bn-address">Full Address (optional)</label>',
      '<input type="text" id="bn-address" placeholder="Street, Purok, House No." /></div>',

      // Notes
      '<div class="form-group"><label for="bn-notes">Notes (optional)</label>',
      '<textarea id="bn-notes" placeholder="Any special instructions..." style="min-height:60px;"></textarea></div>',

      // Fee preview
      '<div id="bn-fee-preview"></div>',

      // Payment method
      '<div class="form-group">',
      '<label style="font-weight:600;color:var(--deep-forest);display:block;margin-bottom:8px;"><i class="fa-solid fa-credit-card" style="margin-right:5px;color:var(--hardware-green);"></i>Payment Method *</label>',
      '<div style="display:flex;gap:12px;flex-wrap:wrap;">',
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 16px;border:2px solid var(--hardware-green);border-radius:8px;flex:1;min-width:120px;transition:border-color 0.2s;" id="bn-lbl-cash">',
      '<input type="radio" name="bn-payment" value="cash" id="bn-pay-cash" checked style="accent-color:var(--hardware-green);" />',
      '<i class="fa-solid fa-money-bill-wave" style="color:#1b5e20;font-size:1.1rem;"></i>',
      '<span style="font-weight:600;">Cash (In-store)</span></label>',
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 16px;border:2px solid #ddd;border-radius:8px;flex:1;min-width:120px;transition:border-color 0.2s;" id="bn-lbl-gcash">',
      '<input type="radio" name="bn-payment" value="gcash" id="bn-pay-gcash" style="accent-color:#0070ba;" />',
      '<i class="fa-solid fa-mobile-screen-button" style="color:#0070ba;font-size:1.1rem;"></i>',
      '<span style="font-weight:600;color:#0070ba;">GCash</span></label>',
      '</div></div>',

      // GCash details panel
      '<div id="bn-gcash-panel" style="display:none;background:#e3f2fd;border:1px solid #90caf9;border-radius:8px;padding:16px;margin-bottom:16px;">',
      '<p style="font-weight:700;color:#0d47a1;margin-bottom:12px;font-size:0.95rem;"><i class="fa-solid fa-mobile-screen-button" style="margin-right:6px;"></i>GCash Payment Details</p>',
      '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">',
      '<div style="flex:1;min-width:140px;">',
      '<p style="font-size:0.78rem;color:#555;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.3px;">GCash Name</p>',
      '<p style="font-weight:800;color:#0d47a1;font-size:1rem;margin-bottom:10px;">' + gcashName + '</p>',
      '<p style="font-size:0.78rem;color:#555;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.3px;">GCash Number</p>',
      '<p style="font-weight:800;color:#0d47a1;font-size:1.15rem;letter-spacing:1px;margin-bottom:10px;">' + gcashNumber + '</p>',
      '<p style="font-size:0.75rem;color:#555;background:#fff;padding:8px 10px;border-radius:6px;border:1px solid #90caf9;">',
      '<i class="fa-solid fa-triangle-exclamation" style="color:#e65100;margin-right:4px;"></i>',
      'Send the <strong>exact amount</strong>. Screenshot your receipt and upload below.',
      '</p></div>',
      '<div style="text-align:center;flex-shrink:0;">',
      '<p style="font-size:0.75rem;color:#555;margin-bottom:6px;font-weight:600;"><i class="fa-solid fa-qrcode"></i> Scan to Pay</p>',
      qrHtml,
      '<p style="font-size:0.68rem;color:#888;margin-top:4px;">Tap QR to enlarge &bull; Open GCash &rarr; Scan QR</p>',
      '</div></div></div>',

      // GCash proof upload
      '<div id="bn-gcash-proof" style="display:none;">',
      '<div class="form-group">',
      '<label for="bn-proof"><i class="fa-solid fa-image" style="margin-right:5px;color:var(--hardware-green);"></i>Upload GCash Receipt Screenshot *</label>',
      '<input type="file" id="bn-proof" accept="image/*" style="padding:8px;border:2px dashed #90caf9;border-radius:8px;width:100%;cursor:pointer;background:#f8fbff;" />',
      '<span class="bn-form-error" id="bn-err-proof">Receipt screenshot is required for GCash.</span>',
      '</div></div>',

      // Actions
      '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:8px;">',
      '<button type="button" id="bn-cancel" style="background:#eee;color:#1a1a1a;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:0.95rem;">Cancel</button>',
      '<button type="submit" class="btn"><i class="fa-solid fa-check" style="margin-right:5px;"></i>Confirm Order</button>',
      '</div></form>',
    ].join('');

    overlay.classList.add('open');

    var form       = document.getElementById('bn-form');
    var qtyInput   = document.getElementById('bn-qty');
    var barInput   = document.getElementById('bn-barangay');
    var feePreview = document.getElementById('bn-fee-preview');
    var successBox = document.getElementById('bn-success');
    var gcashPanel = document.getElementById('bn-gcash-panel');
    var gcashProof = document.getElementById('bn-gcash-proof');
    var lblCash    = document.getElementById('bn-lbl-cash');
    var lblGcash   = document.getElementById('bn-lbl-gcash');

    // ── Close / Cancel buttons — use event delegation so any child click works ──
    var closeBtn  = document.getElementById('bn-close-btn');
    var cancelBtn = document.getElementById('bn-cancel');
    if (closeBtn)  closeBtn.addEventListener('click',  function(e) { e.stopPropagation(); closeOverlay(); });
    if (cancelBtn) cancelBtn.addEventListener('click', function(e) { e.stopPropagation(); closeOverlay(); });
    var qrImg = document.getElementById('bn-qr-img');
    if (qrImg) {
      qrImg.addEventListener('click', function() {
        if (window.QRLightbox) window.QRLightbox.open(qrImg.src);
      });
    }

    // Payment method toggle
    box.querySelectorAll('input[name="bn-payment"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        var isGcash = radio.value === 'gcash';
        gcashPanel.style.display = isGcash ? 'block' : 'none';
        gcashProof.style.display = isGcash ? 'block' : 'none';
        lblCash.style.borderColor  = isGcash ? '#ddd' : 'var(--hardware-green)';
        lblGcash.style.borderColor = isGcash ? '#0070ba' : '#ddd';
      });
    });

    // Delivery fee preview
    function updatePreview() {
      var qty = parseInt(qtyInput.value, 10) || 1;
      var bar = barInput.value.trim();
      if (!bar) { feePreview.style.display = 'none'; return; }
      var info  = Delivery.getDeliveryInfo(bar);
      var total = (Number(product.price) * qty) + info.fee;
      feePreview.style.display = 'block';
      feePreview.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Subtotal (' + qty + 'x)</span><span>&#8369;' + (Number(product.price) * qty).toLocaleString() + '</span></div>'
        + '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Delivery</span><span style="color:' + (info.free ? '#1b5e20' : '#e65100') + '">' + (info.free ? 'FREE' : '&#8369;' + info.fee) + '</span></div>'
        + '<div style="display:flex;justify-content:space-between;font-weight:700;color:var(--deep-forest);border-top:1px solid #ddd;padding-top:6px;margin-top:4px;"><span>Total</span><span>&#8369;' + total.toLocaleString() + '</span></div>';
    }
    qtyInput.addEventListener('input', updatePreview);
    barInput.addEventListener('input', updatePreview);

    function showErr(id, show) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('visible', show);
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var qty      = parseInt(qtyInput.value, 10);
      var barangay = barInput.value.trim();
      var payMethod = box.querySelector('input[name="bn-payment"]:checked');
      var payValue  = payMethod ? payMethod.value : 'cash';
      var proofFile = document.getElementById('bn-proof');

      showErr('bn-err-qty',      isNaN(qty) || qty < 1);
      showErr('bn-err-barangay', !barangay);
      showErr('bn-err-proof',    payValue === 'gcash' && (!proofFile || !proofFile.files || !proofFile.files[0]));
      if (isNaN(qty) || qty < 1 || !barangay) return;
      if (payValue === 'gcash' && (!proofFile || !proofFile.files || !proofFile.files[0])) return;

      function placeWithPayment(proofBase64) {
        var result = Orders.place({
          productId:     product.id,
          productName:   product.name,
          productPrice:  product.price,
          quantity:      qty,
          barangay:      barangay,
          address:       document.getElementById('bn-address').value,
          notes:         document.getElementById('bn-notes').value,
          paymentMethod: payValue,
        });
        if (!result.ok) { alert(result.error); return; }

        // Save GCash payment proof
        if (payValue === 'gcash' && typeof Payment !== 'undefined') {
          var deliveryInfo = Delivery.getDeliveryInfo(barangay);
          var total = (Number(product.price) * qty) + deliveryInfo.fee;
          Payment.submit({
            orderId:       result.order.id,
            productName:   product.name,
            amountPaid:    total,
            paymentMethod: 'gcash',
            proofImage:    proofBase64,
          });
        }

        form.style.display = 'none';
        var msgEl = document.getElementById('bn-success-msg');
        if (payValue === 'gcash') {
          msgEl.innerHTML = '<i class="fa-solid fa-clock" style="color:#e65100;margin-right:4px;"></i>'
            + 'Payment submitted. Please wait for confirmation. '
            + '<a href="account.html" style="color:var(--hardware-green);font-weight:700;">View My Orders &rarr;</a>';
        } else {
          msgEl.innerHTML = 'Order placed! Pay in-store upon pickup/delivery. '
            + '<a href="account.html" style="color:var(--hardware-green);font-weight:700;">View My Orders &rarr;</a>';
        }
        successBox.style.display = 'block';
      }

      if (payValue === 'gcash' && proofFile.files[0]) {
        var reader = new FileReader();
        reader.onload = function(ev) { placeWithPayment(ev.target.result); };
        reader.readAsDataURL(proofFile.files[0]);
      } else {
        placeWithPayment(null);
      }
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.BuyNow = {
    trigger: function(product) {
      var loggedIn = (typeof Auth !== 'undefined') && Auth.isLoggedIn();
      if (loggedIn) {
        showOrderModal(product);
      } else {
        showGuestPrompt(product);
      }
    }
  };
})();
