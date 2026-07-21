import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function useProducts(options = {}) {
  const { category, page = 1, limit = 24, search, sort, all } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchProducts = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${API}/api/products`);
      if (all) {
        url.searchParams.set('all', 'true');
      } else {
        url.searchParams.set('page', page);
        url.searchParams.set('limit', limit);
        if (category && category !== 'all') url.searchParams.set('category', category);
        if (search) url.searchParams.set('search', search);
        if (sort) url.searchParams.set('sort', sort);
      }

      const res = await fetch(url.toString(), { signal });
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const data = await res.json();
      
      if (all) {
        setProducts(data.map(p => ({ ...p, id: p.productId || p.id })));
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        setProducts(data.data.map(p => ({ ...p, id: p.productId || p.id })));
        setTotalPages(data.meta.totalPages);
        setCurrentPage(data.meta.page);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [category, page, limit, search, sort, all]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: () => fetchProducts(),
    totalPages,
    currentPage
  };
}
