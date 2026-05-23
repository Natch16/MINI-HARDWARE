/**
 * product-detail.js — Full product detail page renderer
 * Sections: Header, Image Gallery, Description, Specifications,
 *           Delivery Info, Action Buttons, Store Info, Related Products
 */

function renderAvailableBadge(product) {
  return product.available === true
    ? '<span class="badge-available">&#10003; Available Today</span>'
    : '<span class="badge-unavailable">&#10007; Out of Stock</span>';
}

(function initProductDetail() {
  var container     = document.getElementById('product-detail');
  var footerContact = document.getElementById('footer-contact');
  var settings      = Store.getSettings();

  if (footerContact) footerContact.textContent = settings.contactInfo || '';

  var params  = new URLSearchParams(window.location.search);
  var id      = params.get('id');
  if (!id) { window.location.href = 'products.html'; return; }

  var products = Store.getAll(Store.KEYS.PRODUCTS);
  var product  = products.find(function(p) { return p.id === id; });
  if (!product) { window.location.href = 'products.html'; return; }

  document.title = product.name + ' \u2014 JUDY\'S Mini Hardware';

  var categories = Store.getAll(Store.KEYS.CATEGORIES);
  var cat        = categories.find(function(c) { return c.id === product.category; });
  var catName    = cat ? cat.name : 'Uncategorized';
  var isLoggedIn = (typeof Auth !== 'undefined') && Auth.isLoggedIn();
  var inquiryUrl = 'contact.html?product=' + encodeURIComponent(product.name);
  var messengerUrl = 'https://m.me/judysminihardware?text=' + encodeURIComponent('Hi! I\'m interested in: ' + product.name + ' (\u20b1' + Number(product.price).toLocaleString() + ')');

  // ── Specs: use product.specs if present, else build sensible defaults ──
  var specs = product.specs || {};
  var specRows = '';
  if (specs.material)  specRows += '<tr><td>Material</td><td>' + specs.material + '</td></tr>';
  if (specs.size)      specRows += '<tr><td>Size</td><td>' + specs.size + '</td></tr>';
  if (specs.weight)    specRows += '<tr><td>Weight</td><td>' + specs.weight + '</td></tr>';
  if (specs.usage)     specRows += '<tr><td>Usage</td><td>' + specs.usage + '</td></tr>';
  if (specs.brand)     specRows += '<tr><td>Brand</td><td>' + specs.brand + '</td></tr>';
  if (specs.warranty)  specRows += '<tr><td>Warranty</td><td>' + specs.warranty + '</td></tr>';
  if (!specRows) {
    specRows = '<tr><td>Category</td><td>' + catName + '</td></tr>'
             + '<tr><td>Availability</td><td>' + (product.available ? 'In Stock' : 'Out of Stock') + '</td></tr>';
  }

  // ── Preview images ──────────────────────────────────────────────────────
  var previews = product.previews || [];
  var galleryThumbs = '';
  if (previews.length > 0) {
    galleryThumbs = '<div id="thumb-row" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">'
      + previews.map(function(src, i) {
          return '<img src="' + src + '" alt="Preview ' + (i+1) + '" '
            + 'style="width:72px;height:72px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid transparent;transition:border-color 0.2s;" '
            + 'class="thumb-img" data-src="' + src + '" />';
        }).join('')
      + '</div>';
  }

  // ── Action buttons ──────────────────────────────────────────────────────
  var actionBtns = isLoggedIn
    ? '<button type="button" class="btn" id="place-order-btn" style="flex:1;min-width:140px;"><i class="fa-solid fa-cart-shopping" style="margin-right:6px;"></i>Buy Now</button>'
    : '<a href="login.html?next=product-detail.html%3Fid%3D' + product.id + '" class="btn" style="flex:1;min-width:140px;"><i class="fa-solid fa-right-to-bracket" style="margin-right:6px;"></i>Buy Now &mdash; Sign In</a>';

  // ── Store info from settings ────────────────────────────────────────────
  var storeName    = settings.businessName || "JUDY'S Mini Hardware";
  var storeContact = settings.contactInfo  || 'Contact not set';
  var storeAddress = settings.address      || 'Address not set';

  // ── Build full HTML ─────────────────────────────────────────────────────
  container.innerHTML =

    // LEFT: image gallery
    '<div class="pd-gallery">'
    + '<img id="main-product-img" class="product-detail-img" src="' + (product.image || 'https://via.placeholder.com/600x400?text=No+Image') + '" alt="' + product.name + '" />'
    + galleryThumbs
    + '</div>'

    // RIGHT: info panel
    + '<div class="product-detail-info">'

    // Header
    + '<p class="pd-category-label">' + catName + '</p>'
    + '<h1>' + product.name + '</h1>'
    + '<div class="product-detail-price">&#8369;' + Number(product.price).toLocaleString() + '</div>'
    + '<div style="margin-bottom:18px;">' + renderAvailableBadge(product) + '</div>'

    // Description
    + '<div class="pd-section">'
    + '<h3 class="pd-section-title"><i class="fa-solid fa-file-lines" style="color:var(--hardware-green);margin-right:6px;"></i>Description</h3>'
    + '<p style="line-height:1.8;color:var(--text-muted);">' + (product.description || 'No description available.') + '</p>'
    + '</div>'

    // Specifications
    + '<div class="pd-section">'
    + '<h3 class="pd-section-title"><i class="fa-solid fa-list-check" style="color:var(--hardware-green);margin-right:6px;"></i>Specifications</h3>'
    + '<table class="pd-specs-table">' + specRows + '</table>'
    + '</div>'

    // Delivery info
    + '<div class="pd-section pd-delivery">'
    + '<h3 class="pd-section-title"><i class="fa-solid fa-truck" style="color:var(--hardware-green);margin-right:6px;"></i>Delivery Information</h3>'
    + '<div class="pd-delivery-free"><i class="fa-solid fa-circle-check"></i> <strong>FREE delivery</strong> within Barangay Pangasihan &amp; Barangay Talisay, Gingoog City, Misamis Oriental</div>'
    + '<div class="pd-delivery-paid"><i class="fa-solid fa-truck"></i> Delivery charges apply for other locations</div>'
    + '<div style="margin-top:8px;font-size:0.8rem;color:#c62828;font-weight:600;"><i class="fa-solid fa-triangle-exclamation"></i> No free delivery on Sundays.</div>'
    + '</div>'

    // Action buttons
    + '<div class="product-detail-actions">'
    + actionBtns
    + '</div>'

    // Store info
    + '<div class="pd-section pd-store-info">'
    + '<h3 class="pd-section-title"><i class="fa-solid fa-store" style="color:var(--hardware-green);margin-right:6px;"></i>Store Information</h3>'
    + '<div class="pd-store-row"><span class="pd-store-icon"><i class="fa-solid fa-store"></i></span><div><strong>' + storeName + '</strong></div></div>'
    + '<div class="pd-store-row"><span class="pd-store-icon"><i class="fa-solid fa-phone"></i></span><div>' + storeContact + '</div></div>'
    + '<div class="pd-store-row"><span class="pd-store-icon"><i class="fa-solid fa-location-dot"></i></span><div>' + storeAddress + '</div></div>'
    + '<div class="pd-store-row"><span class="pd-store-icon"><i class="fa-solid fa-clock"></i></span><div>Mon\u2013Sat: 7:00 AM \u2013 6:00 PM &nbsp;|&nbsp; Sun: 8:00 AM \u2013 4:00 PM <span style="color:#c62828;font-size:0.8rem;font-weight:600;">(<i class="fa-solid fa-triangle-exclamation"></i> No delivery on Sundays)</span></div></div>'
    + '</div>'

    + '</div>'; // end product-detail-info

  // ── Thumbnail gallery interaction ───────────────────────────────────────
  var mainImg = document.getElementById('main-product-img');
  document.querySelectorAll('.thumb-img').forEach(function(thumb) {
    thumb.addEventListener('click', function() {
      mainImg.src = thumb.dataset.src;
      document.querySelectorAll('.thumb-img').forEach(function(t) { t.style.borderColor = 'transparent'; });
      thumb.style.borderColor = 'var(--hardware-green)';
    });
  });

  // ── Related products ────────────────────────────────────────────────────
  var relatedContainer = document.getElementById('related-products');
  if (relatedContainer) {
    var allProducts = Store.getAll(Store.KEYS.PRODUCTS);
    var related = allProducts.filter(function(p) {
      return p.category === product.category && p.id !== product.id;
    }).slice(0, 4);
    if (related.length > 0) {
      relatedContainer.innerHTML = related.map(function(p) {
        return '<div class="product-card">'
          + '<img src="' + (p.image || 'https://via.placeholder.com/400x200?text=No+Image') + '" alt="' + p.name + '" loading="lazy" />'
          + '<div class="product-card-body">'
          + (p.available ? '<span class="badge-available">Available Today</span>' : '<span class="badge-unavailable">Out of Stock</span>')
          + '<div class="product-card-name">' + p.name + '</div>'
          + '<div class="product-card-price">&#8369;' + Number(p.price).toLocaleString() + '</div>'
          + '<a href="product-detail.html?id=' + p.id + '" class="btn btn-sm">View Details</a>'
          + '</div></div>';
      }).join('');
      document.getElementById('related-section').style.display = 'block';
    }
  }

  // ── Order modal (logged-in only) ────────────────────────────────────────
  if (!isLoggedIn) return;

  // Load dynamic GCash config
  var gcash       = (typeof Payment !== 'undefined') ? Payment.getGcashConfig() : { name: 'Judy Hardware', number: '09XX XXX XXXX', qrSrc: '' };
  var gcashName   = gcash.name   || 'Judy Hardware';
  var gcashNumber = gcash.number || '09XX XXX XXXX';
  var gcashQrSrc  = gcash.qrSrc  || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png';

  var modalDiv = document.createElement('div');
  modalDiv.id = 'order-modal';
  modalDiv.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;align-items:center;justify-content:center;padding:16px;';
  modalDiv.innerHTML = [
    '<div style="background:var(--white);border-radius:var(--radius);box-shadow:0 8px 40px rgba(0,0,0,0.2);width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding:24px;">',
    '<h2 style="color:var(--deep-forest);margin-bottom:4px;font-size:1.2rem;"><i class="fa-solid fa-cart-shopping" style="margin-right:6px;"></i>Place Order</h2>',
    '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:18px;">' + product.name + ' &mdash; &#8369;' + Number(product.price).toLocaleString() + ' each</p>',

    // Success state
    '<div id="order-success" style="display:none;background:#e8f5e9;border:1px solid var(--hardware-green);color:var(--deep-forest);padding:14px 16px;border-radius:var(--radius);margin-bottom:16px;">',
    '<p style="font-weight:700;margin-bottom:6px;"><i class="fa-solid fa-circle-check"></i> Order placed successfully!</p>',
    '<p style="font-size:0.88rem;" id="order-success-msg"></p>',
    '</div>',

    '<form id="order-form" novalidate>',

    // Qty
    '<div class="form-group"><label for="o-qty">Quantity</label>',
    '<input type="number" id="o-qty" value="1" min="1" max="100" />',
    '<span class="form-error" id="err-o-qty">Enter a valid quantity.</span></div>',

    // Barangay
    '<div class="form-group"><label for="o-barangay">Barangay *</label>',
    '<input type="text" id="o-barangay" placeholder="e.g. Talisay, Pangasihan..." />',
    '<span class="form-error" id="err-o-barangay">Barangay is required.</span></div>',

    // Address
    '<div class="form-group"><label for="o-address">Full Address (optional)</label>',
    '<input type="text" id="o-address" placeholder="Street, Purok, House No." /></div>',

    // Notes
    '<div class="form-group"><label for="o-notes">Order Notes (optional)</label>',
    '<textarea id="o-notes" placeholder="Any special instructions..." style="min-height:60px;"></textarea></div>',

    // Fee preview
    '<div id="order-fee-preview" style="background:var(--light-gray);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px;font-size:0.88rem;display:none;"></div>',

    // Payment method
    '<div class="form-group">',
    '<label style="font-weight:600;color:var(--deep-forest);"><i class="fa-solid fa-credit-card" style="margin-right:5px;color:var(--hardware-green);"></i>Payment Method *</label>',
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">',
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 16px;border:2px solid #ddd;border-radius:var(--radius);flex:1;min-width:120px;transition:border-color 0.2s;" id="lbl-cash">',
    '<input type="radio" name="o-payment" value="cash" id="pay-cash" checked style="accent-color:var(--hardware-green);" />',
    '<i class="fa-solid fa-money-bill-wave" style="color:#1b5e20;font-size:1.1rem;"></i>',
    '<span style="font-weight:600;">Cash (In-store)</span></label>',
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 16px;border:2px solid #ddd;border-radius:var(--radius);flex:1;min-width:120px;transition:border-color 0.2s;" id="lbl-gcash">',
    '<input type="radio" name="o-payment" value="gcash" id="pay-gcash" style="accent-color:#0070ba;" />',
    '<i class="fa-solid fa-mobile-screen-button" style="color:#0070ba;font-size:1.1rem;"></i>',
    '<span style="font-weight:600;color:#0070ba;">GCash</span></label>',
    '</div></div>',

    // GCash details panel
    '<div id="gcash-panel" style="display:none;background:#e3f2fd;border:1px solid #90caf9;border-radius:var(--radius);padding:16px;margin-bottom:16px;">',
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
    '<img src="' + gcashQrSrc + '" alt="GCash QR Code" id="pd-qr-img" class="qr-zoomable" style="width:110px;height:110px;border-radius:8px;border:2px solid #90caf9;display:block;object-fit:contain;" />',
    '<p style="font-size:0.68rem;color:#888;margin-top:4px;">Tap QR to enlarge &bull; Open GCash &rarr; Scan QR</p>',
    '</div></div></div>',

    // GCash proof upload
    '<div id="gcash-proof-section" style="display:none;">',
    '<div class="form-group">',
    '<label for="o-proof"><i class="fa-solid fa-image" style="margin-right:5px;color:var(--hardware-green);"></i>Upload GCash Receipt Screenshot *</label>',
    '<input type="file" id="o-proof" accept="image/*" style="padding:8px;border:2px dashed #90caf9;border-radius:var(--radius);width:100%;cursor:pointer;background:#f8fbff;" />',
    '<span class="form-error" id="err-o-proof">Receipt screenshot is required for GCash.</span>',
    '</div></div>',

    '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:4px;">',
    '<button type="button" id="order-cancel-btn" style="background:#eee;color:var(--text-dark);border:none;padding:10px 20px;border-radius:var(--radius);cursor:pointer;font-size:0.95rem;">Cancel</button>',
    '<button type="submit" class="btn"><i class="fa-solid fa-check" style="margin-right:5px;"></i>Confirm Order</button>',
    '</div></form></div>',
  ].join('');
  document.body.appendChild(modalDiv);

  // QR zoom on click
  var pdQrImg = document.getElementById('pd-qr-img');
  if (pdQrImg) {
    pdQrImg.addEventListener('click', function() {
      if (window.QRLightbox) window.QRLightbox.open(pdQrImg.src);
    });
  }

  var modal      = document.getElementById('order-modal');
  var orderForm  = document.getElementById('order-form');
  var feePreview = document.getElementById('order-fee-preview');
  var oBarangay  = document.getElementById('o-barangay');
  var oQty       = document.getElementById('o-qty');
  var gcashPanel = document.getElementById('gcash-panel');
  var gcashProof = document.getElementById('gcash-proof-section');

  // Payment method toggle
  document.querySelectorAll('input[name="o-payment"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      var isGcash = radio.value === 'gcash';
      gcashPanel.style.display = isGcash ? 'block' : 'none';
      gcashProof.style.display = isGcash ? 'block' : 'none';
      document.getElementById('lbl-cash').style.borderColor  = isGcash ? '#ddd' : 'var(--hardware-green)';
      document.getElementById('lbl-gcash').style.borderColor = isGcash ? '#0070ba' : '#ddd';
    });
  });
  // Set initial border for cash
  document.getElementById('lbl-cash').style.borderColor = 'var(--hardware-green)';

  function updateFeePreview() {
    var qty = parseInt(oQty.value, 10) || 1;
    var bar = oBarangay.value.trim();
    if (!bar) { feePreview.style.display = 'none'; return; }
    var info  = Delivery.getDeliveryInfo(bar);
    var total = (Number(product.price) * qty) + info.fee;
    feePreview.style.display = 'block';
    feePreview.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Subtotal (' + qty + 'x)</span><span>&#8369;' + (Number(product.price)*qty).toLocaleString() + '</span></div>'
      + '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Delivery</span><span style="color:' + (info.free?'#1b5e20':'#e65100') + '">' + (info.free?'FREE':'&#8369;'+info.fee) + '</span></div>'
      + '<div style="display:flex;justify-content:space-between;font-weight:700;color:var(--deep-forest);border-top:1px solid #ddd;padding-top:6px;margin-top:4px;"><span>Total</span><span>&#8369;' + total.toLocaleString() + '</span></div>';
  }

  oBarangay.addEventListener('input', updateFeePreview);
  oQty.addEventListener('input', updateFeePreview);

  document.getElementById('place-order-btn').addEventListener('click', function() {
    modal.style.display = 'flex';
    document.getElementById('order-success').style.display = 'none';
    orderForm.style.display = 'block';
  });

  function closeModal() { modal.style.display = 'none'; }

  document.getElementById('order-cancel-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    closeModal();
  });
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

  function showOErr(id, show) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('visible', show);
  }

  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var qty      = parseInt(oQty.value, 10);
    var barangay = oBarangay.value.trim();
    var payMethod = document.querySelector('input[name="o-payment"]:checked');
    var payValue  = payMethod ? payMethod.value : 'cash';
    var proofFile = document.getElementById('o-proof');

    showOErr('err-o-qty',      isNaN(qty) || qty < 1);
    showOErr('err-o-barangay', !barangay);
    showOErr('err-o-proof',    payValue === 'gcash' && (!proofFile || !proofFile.files || !proofFile.files[0]));
    if (isNaN(qty) || qty < 1 || !barangay) return;
    if (payValue === 'gcash' && (!proofFile || !proofFile.files || !proofFile.files[0])) return;

    function placeWithPayment(proofBase64) {
      var result = Orders.place({
        productId: product.id, productName: product.name, productPrice: product.price,
        quantity: qty, barangay: barangay,
        address: document.getElementById('o-address').value,
        notes:   document.getElementById('o-notes').value,
        paymentMethod: payValue,
      });
      if (!result.ok) { alert(result.error); return; }

      // Save payment proof if GCash
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

      orderForm.style.display = 'none';
      var successDiv = document.getElementById('order-success');
      var msgEl = document.getElementById('order-success-msg');
      if (payValue === 'gcash') {
        msgEl.innerHTML = '<i class="fa-solid fa-clock" style="color:#e65100;margin-right:4px;"></i>'
          + 'Payment submitted. Please wait for confirmation. '
          + '<a href="account.html" style="color:var(--hardware-green);font-weight:700;">View My Orders &rarr;</a>';
      } else {
        msgEl.innerHTML = 'Order placed! Pay in-store upon pickup/delivery. '
          + '<a href="account.html" style="color:var(--hardware-green);font-weight:700;">View My Orders &rarr;</a>';
      }
      successDiv.style.display = 'block';
    }

    if (payValue === 'gcash' && proofFile.files[0]) {
      var reader = new FileReader();
      reader.onload = function(ev) { placeWithPayment(ev.target.result); };
      reader.readAsDataURL(proofFile.files[0]);
    } else {
      placeWithPayment(null);
    }
  });
})();
