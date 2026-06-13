import { Heart, Loader2 } from 'lucide-react';

export default function WishlistButton({ 
  productId, 
  wishlistIds, 
  toggle, 
  loadingIds = new Set(),
  className = '' 
}) {
  const isWishlisted = wishlistIds.has(productId);
  const isLoading = loadingIds.has(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading) toggle(productId);
      }}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors duration-200 
        ${isWishlisted 
          ? 'bg-stone-900 text-white' 
          : 'bg-white text-stone-400 hover:text-stone-900 border border-stone-200'
        }
        ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading 
        ? <Loader2 size={16} className="animate-spin" />
        : <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={1.5} />
      }
    </button>
  );
}