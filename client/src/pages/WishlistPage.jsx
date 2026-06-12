import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { getAuthHeaders } from '../utils/getAuthHeaders';
import { formatCurrency } from '../utils/formatters';

const API = import.meta.env.VITE_API_URL;

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistIds, toggle } = useWishlist(user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders(user);
        const res = await fetch(`${API}/api/wishlist/${user.uid}`, { headers });
        const data = await res.json();
        setProducts(data.items || []);
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  // Keep local products in sync when items are removed via toggle
  useEffect(() => {
    setProducts(prev => prev.filter(p => wishlistIds.has(p.productId)));
  }, [wishlistIds]);

  const handleAddToCart = async (productId) => {
    try {
      const headers = await getAuthHeaders(user);
      await fetch(`${API}/api/cart/${user.uid}/add`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
    } catch (err) {
      console.error('Add to cart failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Your Collection</p>
        <h1 className="font-['DM_Serif_Display'] text-4xl text-stone-900">Wishlist</h1>
      </div>

      {products.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Heart size={48} className="text-stone-200 mb-6" strokeWidth={1} />
          <h2 className="font-['DM_Serif_Display'] text-2xl text-stone-900 mb-3">
            Nothing saved yet
          </h2>
          <p className="text-stone-400 text-sm mb-8 max-w-xs">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            to="/home"
            className="px-8 py-3 bg-stone-900 text-white text-sm rounded-full 
              hover:bg-stone-700 transition-colors duration-200"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div
              key={product.productId}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden 
                hover:shadow-md transition-shadow duration-300"
            >
              {/* Product Image */}
              <Link to={`/product/${product.productId}`}>
                <div className="aspect-square bg-stone-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 
                      transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-4">
                {/* Badge */}
                {product.badge && (
                  <span className="text-xs tracking-[0.15em] uppercase text-stone-400">
                    {product.badge}
                  </span>
                )}

                {/* Name */}
                <Link to={`/product/${product.productId}`}>
                  <h3 className="font-['DM_Serif_Display'] text-lg text-stone-900 
                    mt-1 mb-1 hover:text-stone-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-xs text-stone-400 mb-3">{product.brand}</p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-stone-900 font-medium">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-stone-400 text-sm line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product.productId)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 
                      bg-stone-900 text-white text-sm rounded-full 
                      hover:bg-stone-700 transition-colors duration-200"
                  >
                    <ShoppingCart size={14} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggle(product.productId)}
                    className="p-2 rounded-full border border-stone-200 text-stone-400 
                      hover:text-red-500 hover:border-red-200 transition-colors duration-200"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}