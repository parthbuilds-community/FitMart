import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuthHeaders } from '../utils/getAuthHeaders';

const API = import.meta.env.VITE_API_URL;

export function useWishlist(user) {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loadingIds, setLoadingIds] = useState(new Set()); // per-item loading
  const [error, setError] = useState(null);
  
  // useRef to always have fresh wishlistIds without it being a dependency
  const wishlistRef = useRef(wishlistIds);
  useEffect(() => { wishlistRef.current = wishlistIds; }, [wishlistIds]);

  useEffect(() => {
    if (!user) return;
    const fetchWishlist = async () => {
      try {
        const headers = await getAuthHeaders(user);
        const res = await window.fetch(`${API}/api/wishlist/${user.uid}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        const data = await res.json();
        const ids = new Set(data.items.map(p => p.productId));
        setWishlistIds(ids);
      } catch (err) {
        setError('Could not load wishlist');
        console.error(err);
      }
    };
    fetchWishlist();
  }, [user]);

  const toggle = useCallback(async (productId) => {
    if (!user) return;
    
    // Read from ref — always fresh, no stale closure
    const isWishlisted = wishlistRef.current.has(productId);

    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev);
      isWishlisted ? next.delete(productId) : next.add(productId);
      return next;
    });

    // Per-item loading state
    setLoadingIds(prev => new Set(prev).add(productId));

    try {
      const headers = await getAuthHeaders(user);
      const endpoint = isWishlisted ? 'remove' : 'add';
      const res = await window.fetch(`${API}/api/wishlist/${user.uid}/${endpoint}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error('Request failed');
      setError(null);
    } catch (err) {
      // Revert optimistic update
      setWishlistIds(prev => {
        const next = new Set(prev);
        isWishlisted ? next.add(productId) : next.delete(productId);
        return next;
      });
      setError('Could not update wishlist. Try again.');
      console.error(err);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [user]); // ← only `user` as dependency now, not wishlistIds

  return { wishlistIds, toggle, loadingIds, error };
}