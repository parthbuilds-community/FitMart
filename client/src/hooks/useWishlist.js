import { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../utils/getAuthHeaders';

const API = import.meta.env.VITE_API_URL;

export function useWishlist(user) {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch wishlist IDs on mount
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const headers = await getAuthHeaders(user);
        const res = await window.fetch(`${API}/api/wishlist/${user.uid}`, { headers });
        const data = await res.json();
        const ids = new Set(data.items.map(p => p.productId));
        setWishlistIds(ids);
      } catch (err) {
        console.error('Failed to load wishlist', err);
      }
    };
    fetch();
  }, [user]);

  const toggle = useCallback(async (productId) => {
    if (!user) return;
    const isWishlisted = wishlistIds.has(productId);

    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev);
      isWishlisted ? next.delete(productId) : next.add(productId);
      return next;
    });

    try {
      const headers = await getAuthHeaders(user);
      const endpoint = isWishlisted ? 'remove' : 'add';
      const res = await window.fetch(`${API}/api/wishlist/${user.uid}/${endpoint}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error('Request failed');
    } catch (err) {
      // Revert on failure
      setWishlistIds(prev => {
        const next = new Set(prev);
        isWishlisted ? next.add(productId) : next.delete(productId);
        return next;
      });
      console.error('Wishlist toggle failed', err);
    }
  }, [user, wishlistIds]);

  return { wishlistIds, toggle, loading };
}