import { Link } from 'react-router-dom';

/**
 * Shown when a guest clicks "Buy Now" without being logged in.
 * Offers Login, Create Account, and Cancel options.
 */
export default function AuthPromptModal({ open, onClose, productId }) {
  if (!open) return null;

  const loginHref    = productId ? `/login?next=/products/${productId}`    : '/login';
  const registerHref = productId ? `/register?next=/products/${productId}` : '/register';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[2000] flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-lg p-6 sm:p-7"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-[#e8f5e9] flex items-center justify-center">
            <i className="fa-solid fa-lock text-forest text-2xl" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-forest font-bold text-center text-[1.15rem] mb-2">
          Sign In Required
        </h2>
        <p className="text-muted text-sm text-center mb-6 leading-relaxed">
          You need to create an account or log in first before you can proceed with a purchase.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to={loginHref}
            className="w-full bg-forest text-white py-2.5 rounded-lg font-semibold text-center hover:bg-green transition-colors"
          >
            <i className="fa-solid fa-right-to-bracket mr-2" />
            Log In
          </Link>
          <Link
            to={registerHref}
            className="w-full bg-transparent border-2 border-forest text-forest py-2.5 rounded-lg font-semibold text-center hover:bg-forest hover:text-white transition-colors"
          >
            <i className="fa-solid fa-user-plus mr-2" />
            Create Account
          </Link>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-muted py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors border-0 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
