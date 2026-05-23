import { Link } from 'react-router-dom';

export default function ProductCard({ product, onBuyNow }) {
  return (
    <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden border-2 border-transparent hover:border-growth hover:shadow-[0_6px_24px_rgba(0,75,35,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <img
        src={product.image || 'https://via.placeholder.com/400x200?text=No+Image'}
        alt={product.name}
        className="w-full h-[180px] sm:h-[200px] object-cover"
        loading="lazy"
      />
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col gap-2">
        {/* Availability badge — full width on mobile to match image */}
        {product.available ? (
          <span className="block w-full text-center bg-growth text-white text-xs sm:text-[0.78rem] font-bold px-2.5 py-1.5 sm:py-1 rounded-full sm:rounded-full sm:inline-block sm:w-auto">
            ✓ Available Today
          </span>
        ) : (
          <span className="block w-full text-center bg-gray-300 text-gray-600 text-xs sm:text-[0.78rem] font-bold px-2.5 py-1.5 sm:py-1 rounded-full sm:inline-block sm:w-auto">
            ✗ Out of Stock
          </span>
        )}

        <div className="font-bold text-forest text-[0.95rem]">{product.name}</div>
        <div className="text-green font-bold text-[1.05rem]">
          ₱{Number(product.price).toLocaleString()}
        </div>

        {/* Buttons:
            Mobile  — stacked vertically, full-width, large rounded corners (matches image)
            Desktop — side by side (original layout) */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <Link
            to={`/products/${product.id}`}
            className="
              w-full text-center font-semibold transition-colors
              border-2 border-green text-green bg-white hover:bg-green hover:text-white
              py-2 sm:py-1.5
              rounded-xl sm:rounded-lg
              text-sm
              cursor-pointer
            "
          >
            Details
          </Link>
          <button
            onClick={() => onBuyNow(product)}
            className="
              w-full text-center font-semibold transition-colors
              bg-green text-white hover:bg-growth
              py-2 sm:py-1.5
              rounded-xl sm:rounded-lg
              text-sm
              cursor-pointer border-0
            "
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
