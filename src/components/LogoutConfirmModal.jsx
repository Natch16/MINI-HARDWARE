/**
 * Confirmation dialog shown before logging the admin out.
 */
export default function LogoutConfirmModal({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-[0_8px_40px_rgba(0,0,0,0.2)] w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-[#fce4ec] flex items-center justify-center">
            <i className="fa-solid fa-right-from-bracket text-[#c62828] text-2xl" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-forest font-bold text-center text-[1.1rem] mb-2">
          Confirm Logout
        </h2>
        <p className="text-muted text-sm text-center mb-6">
          Are you sure you want to log out?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-dark py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors border-0 cursor-pointer"
          >
            No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#c62828] text-white py-2.5 rounded-lg font-semibold hover:bg-[#b71c1c] transition-colors border-0 cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket mr-1.5" />
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}
