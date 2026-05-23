/**
 * delivery.js — Delivery fee logic for JUDY'S Mini Hardware
 *
 * Free delivery: Barangay Talisay and Barangay Pangasihan, Gingoog City, Misamis Oriental
 * Outside these barangays: delivery fee applies
 */

const Delivery = (() => {
  // Canonical free-delivery barangay names (lowercase for comparison)
  // Accepts both "pangasihan" and common misspelling "pangansian"
  const FREE_BARANGAYS = ['talisay', 'pangasihan', 'pangansian'];

  // Default delivery fee for outside barangays (in PHP)
  const DEFAULT_FEE = 80;

  function normalize(input) {
    return input
      .toLowerCase()
      .replace(/^(barangay|brgy\.?|bgy\.?)\s*/i, '')
      .trim();
  }

  function getDeliveryInfo(barangay) {
    if (!barangay || barangay.trim() === '') {
      return { free: false, fee: DEFAULT_FEE, label: 'Enter your barangay to check delivery fee', barangay: '' };
    }
    const normalized = normalize(barangay);
    const isFree = FREE_BARANGAYS.includes(normalized);
    return {
      free: isFree,
      fee: isFree ? 0 : DEFAULT_FEE,
      label: isFree
        ? '🎉 Free delivery to your barangay!'
        : `🚚 Delivery fee: ₱${DEFAULT_FEE} (outside free-delivery area)`,
      barangay: barangay.trim(),
    };
  }

  function getFreeBarangays() {
    return ['Talisay', 'Pangasihan'];
  }

  return { getDeliveryInfo, getFreeBarangays, DEFAULT_FEE };
})();

export { Delivery };
