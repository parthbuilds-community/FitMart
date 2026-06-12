import { Heart } from 'lucide-react';

export default function WishlistButton({ productId, wishlistIds, toggle, className = '' }) {
  const isWishlisted = wishlistIds.has(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={`p-2 rounded-full transition-colors duration-200 
        ${isWishlisted 
          ? 'bg-stone-900 text-white' 
          : 'bg-white text-stone-400 hover:text-stone-900 border border-stone-200'
        } ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={16}
        fill={isWishlisted ? 'currentColor' : 'none'}
        strokeWidth={1.5}
      />
    </button>
  );
}