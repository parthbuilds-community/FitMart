import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function useProductDetails(productId) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async (signal) => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/products?all=true`, { signal });
      if (!res.ok) throw new Error("Failed to load products");
      
      const all = await res.json();
      const normalised = all.map(p => ({ ...p, id: p.productId || p.id }));
      setAllProducts(normalised);
      
      const found = normalised.find(p => String(p.productId) === String(productId));
      if (!found) throw new Error("Product not found");
      
      setProduct(found);
      setRelatedProducts(
        normalised
          .filter(p => p.category === found.category && String(p.productId) !== String(productId))
          .slice(0, 4)
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => controller.abort();
  }, [fetchProduct]);

  return {
    product,
    relatedProducts,
    allProducts,
    loading,
    error,
    refetch: () => fetchProduct()
  };
}
