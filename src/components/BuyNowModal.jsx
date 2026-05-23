import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import {
  orderController,
  paymentController,
  deliveryController,
} from '../controllers/userController.js';

export default function BuyNowModal({ product, open, onClose }) {
  const [qty, setQty] = useState(1);
  const [barangay, setBarangay] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [proofFile, setProofFile] = useState(null);
  const [proofBase64, setProofBase64] = useState('');
  const [gcashConfig, setGcashConfig] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrLightbox, setQrLightbox] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setQty(1);
      setBarangay('');
      setAddress('');
      setNotes('');
      setPaymentMethod('cash');
      setProofFile(null);
      setProofBase64('');
      setGcashConfig(null);
      setDeliveryInfo(null);
      setErrors({});
      setSuccess(false);
      setSubmitting(false);
      setQrLightbox(false);
    }
  }, [open]);

  // Load delivery info when barangay changes
  useEffect(() => {
    if (barangay.trim()) {
      const info = deliveryController.getDeliveryInfo(barangay);
      setDeliveryInfo(info);
    } else {
      setDeliveryInfo(null);
    }
  }, [barangay]);

  // Load GCash config when payment method is gcash
  useEffect(() => {
    if (paymentMethod === 'gcash' && !gcashConfig) {
      const config = paymentController.getGcashConfig();
      setGcashConfig(config);
    }
  }, [paymentMethod, gcashConfig]);

  // Convert proof file to base64
  function handleProofChange(e) {
    const file = e.target.files[0];
    setProofFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setProofBase64(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setProofBase64('');
    }
  }

  const subtotal = product ? Number(product.price) * qty : 0;
  const deliveryFee = deliveryInfo?.fee || 0;
  const total = subtotal + deliveryFee;

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!qty || qty < 1) newErrors.qty = 'Enter a valid quantity.';
    if (!barangay.trim()) newErrors.barangay = 'Barangay is required.';
    if (paymentMethod === 'gcash' && !proofBase64) newErrors.proof = 'Receipt screenshot is required for GCash.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = orderController.place({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        quantity: qty,
        barangay,
        address,
        notes,
      });
      if (!result.ok) {
        setErrors({ submit: result.error });
        setSubmitting(false);
        return;
      }

      if (paymentMethod === 'gcash') {
        paymentController.submit({
          orderId: result.order.id,
          productName: product.name,
          amountPaid: total,
          paymentMethod: 'gcash',
          proofImage: proofBase64,
          notes,
        });
      } else {
        paymentController.submit({
          orderId: result.order.id,
          productName: product.name,
          amountPaid: total,
          paymentMethod: 'cash',
          proofImage: null,
          notes,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
      setSubmitting(false);
    }
  }

  if (!product) return null;

  const gcash = gcashConfig || { name: 'Judy Hardware', number: '09XX XXX XXXX', qrSrc: '' };

  return (
    <>
    <Modal open={open} onClose={onClose} title="Buy Now">
      <p className="text-muted text-sm mb-4">
        <strong>{product.name}</strong> &mdash; ₱{Number(product.price).toLocaleString()} each
      </p>

      {success ? (
        <div className="bg-[#e8f5e9] border border-green text-forest p-4 rounded-lg text-sm font-medium">
          <p className="font-bold mb-1">✓ Order placed successfully!</p>
          <p>
            {paymentMethod === 'gcash'
              ? 'Payment submitted. Please wait for confirmation.'
              : 'Order placed! Pay in-store upon pickup/delivery.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Quantity */}
          <div className="mb-4">
            <label className="block font-semibold text-forest text-[0.88rem] mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={e => setQty(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green"
            />
            {errors.qty && <p className="text-red-600 text-xs mt-1">{errors.qty}</p>}
          </div>

          {/* Barangay */}
          <div className="mb-2">
            <label className="block font-semibold text-forest text-[0.88rem] mb-1">
              Barangay *
            </label>
            <input
              type="text"
              value={barangay}
              onChange={e => setBarangay(e.target.value)}
              placeholder="e.g. Talisay, Pangasihan..."
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green"
            />
            {errors.barangay && <p className="text-red-600 text-xs mt-1">{errors.barangay}</p>}
          </div>
          <p className="text-xs text-muted mb-4">
            Free delivery: <strong>Talisay</strong> &amp; <strong>Pangasihan</strong> &bull;{' '}
            <span className="text-red-700 font-semibold">No free delivery on Sundays</span>
          </p>

          {/* Delivery fee preview */}
          {deliveryInfo && (
            <div className="bg-light rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>Subtotal ({qty}x)</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Delivery</span>
                <span className={deliveryInfo.free ? 'text-green font-semibold' : 'text-orange-600 font-semibold'}>
                  {deliveryInfo.free ? 'FREE' : `₱${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-forest border-t border-gray-200 pt-2 mt-1">
                <span>Total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="mb-4">
            <label className="block font-semibold text-forest text-[0.88rem] mb-1">
              Full Address (optional)
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Street, Purok, House No."
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green"
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block font-semibold text-forest text-[0.88rem] mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              rows={2}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green resize-y"
            />
          </div>

          {/* Payment method */}
          <div className="mb-4">
            <label className="block font-semibold text-forest text-[0.88rem] mb-2">
              Payment Method *
            </label>
            <div className="flex gap-3 flex-wrap">
              <label
                className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 border-2 rounded-lg flex-1 min-w-[120px] transition-colors ${
                  paymentMethod === 'cash' ? 'border-green' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="accent-green"
                />
                <i className="fa-solid fa-money-bill-wave text-[#1b5e20]" />
                <span className="font-semibold text-sm">Cash (In-store)</span>
              </label>
              <label
                className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 border-2 rounded-lg flex-1 min-w-[120px] transition-colors ${
                  paymentMethod === 'gcash' ? 'border-[#0070ba]' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="gcash"
                  checked={paymentMethod === 'gcash'}
                  onChange={() => setPaymentMethod('gcash')}
                  className="accent-[#0070ba]"
                />
                <i className="fa-solid fa-mobile-screen-button text-[#0070ba]" />
                <span className="font-semibold text-sm text-[#0070ba]">GCash</span>
              </label>
            </div>
          </div>

          {/* GCash panel */}
          {paymentMethod === 'gcash' && (
            <>
              <div className="bg-[#e3f2fd] border border-[#90caf9] rounded-lg p-4 mb-4">
                <p className="font-bold text-[#0d47a1] mb-3 text-[0.95rem]">
                  <i className="fa-solid fa-mobile-screen-button mr-1.5" />
                  GCash Payment Details
                </p>
                <div className="flex gap-4 items-start flex-wrap">
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs text-muted uppercase tracking-wide mb-0.5">GCash Name</p>
                    <p className="font-extrabold text-[#0d47a1] mb-2.5">{gcash.name}</p>
                    <p className="text-xs text-muted uppercase tracking-wide mb-0.5">GCash Number</p>
                    <p className="font-extrabold text-[#0d47a1] text-lg tracking-widest mb-2.5">{gcash.number}</p>
                    <p className="text-xs text-muted bg-white p-2 rounded border border-[#90caf9]">
                      <i className="fa-solid fa-triangle-exclamation text-orange-600 mr-1" />
                      Send the <strong>exact amount</strong>. Screenshot your receipt and upload below.
                    </p>
                  </div>
                  {gcash.qrSrc && (
                    <div className="text-center flex-shrink-0">
                      <p className="text-xs text-muted mb-1.5 font-semibold">
                        <i className="fa-solid fa-qrcode" /> Scan to Pay
                      </p>
                      <button
                        type="button"
                        onClick={() => setQrLightbox(true)}
                        className="bg-transparent border-0 p-0 cursor-zoom-in group"
                        title="Click to enlarge"
                      >
                        <img
                          src={gcash.qrSrc}
                          alt="GCash QR Code"
                          className="w-[110px] h-[110px] rounded-lg border-2 border-[#90caf9] object-contain group-hover:border-[#0070ba] transition-colors"
                        />
                      </button>
                      <p className="text-[0.65rem] text-muted mt-1">
                        <i className="fa-solid fa-magnifying-glass-plus mr-0.5" />Tap to enlarge
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof upload */}
              <div className="mb-4">
                <label className="block font-semibold text-forest text-[0.88rem] mb-1">
                  <i className="fa-solid fa-image mr-1 text-green" />
                  Upload GCash Receipt Screenshot *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofChange}
                  className="w-full p-2 border-2 border-dashed border-[#90caf9] rounded-lg cursor-pointer bg-[#f8fbff] text-sm"
                />
                {errors.proof && <p className="text-red-600 text-xs mt-1">{errors.proof}</p>}
              </div>
            </>
          )}

          {/* Order summary (always shown when barangay filled) */}
          {deliveryInfo && (
            <div className="bg-light rounded-lg p-3 mb-4 text-sm border border-gray-200">
              <p className="font-bold text-forest mb-2">Order Summary</p>
              <div className="flex justify-between mb-1">
                <span>Subtotal ({qty}x ₱{Number(product.price).toLocaleString()})</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Delivery Fee</span>
                <span className={deliveryInfo.free ? 'text-green font-semibold' : 'text-orange-600 font-semibold'}>
                  {deliveryInfo.free ? 'FREE' : `₱${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-forest border-t border-gray-200 pt-2 mt-1">
                <span>Total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {errors.submit && (
            <p className="text-red-600 text-sm mb-3">{errors.submit}</p>
          )}

          <div className="flex gap-2.5 justify-end flex-wrap mt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-dark border-0 px-5 py-2.5 rounded-lg cursor-pointer text-[0.95rem] hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green text-white px-5 py-2.5 rounded-lg font-semibold text-[0.95rem] hover:bg-growth transition-colors disabled:opacity-60 cursor-pointer"
            >
              <i className="fa-solid fa-check mr-1" />
              Confirm Order
            </button>
          </div>
        </form>
      )}
    </Modal>

    {/* QR Code Lightbox */}
    {qrLightbox && gcash.qrSrc && (
      <div
        className="fixed inset-0 bg-black/85 z-[3000] flex flex-col items-center justify-center p-5"
        onClick={() => setQrLightbox(false)}
      >
        <div
          className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col items-center max-w-[320px] w-full shadow-[0_8px_48px_rgba(0,0,0,0.5)]"
          onClick={e => e.stopPropagation()}
        >
          <p className="font-bold text-[#0d47a1] mb-3 text-base">
            <i className="fa-solid fa-qrcode mr-1.5" />GCash QR Code
          </p>
          <img
            src={gcash.qrSrc}
            alt="GCash QR Code"
            className="w-full max-w-[260px] rounded-xl border-2 border-[#90caf9] object-contain"
          />
          <p className="text-xs text-muted mt-3 text-center">
            Open GCash → Scan QR → Send <strong>exact amount</strong>
          </p>
          <button
            type="button"
            onClick={() => setQrLightbox(false)}
            className="mt-4 bg-[#0070ba] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#005fa3] transition-colors border-0 cursor-pointer"
          >
            <i className="fa-solid fa-xmark mr-1.5" />Close
          </button>
        </div>
      </div>
    )}
    </>
  );
}
