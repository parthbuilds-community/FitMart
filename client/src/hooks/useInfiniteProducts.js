import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';

async function fetchProducts({ pageParam = 1, queryKey }) {
  const [_key, params] = queryKey;
  const searchParams = new URLSearchParams();
  searchParams.set('page', pageParam);
  searchParams.set('limit', params.limit || 24);
  if (params.category) searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);
  if (params.sort) searchParams.set('sort', params.sort);
  return apiFetch(`/api/products?${searchParams.toString()}`);
}

export default function useInfiniteProducts(params = { limit: 24 }) {
  return useInfiniteQuery({
    queryKey: ['products', params],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10,
  });
}
