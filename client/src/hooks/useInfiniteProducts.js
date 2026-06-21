import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

async function fetchProducts({ pageParam = 1, queryKey }) {
  const [_key, params] = queryKey;
  const url = new URL('/api/products', 'http://example');
  url.searchParams.set('page', pageParam);
  url.searchParams.set('limit', params.limit || 24);
  if (params.category) url.searchParams.set('category', params.category);
  if (params.search) url.searchParams.set('search', params.search);
  if (params.sort) url.searchParams.set('sort', params.sort);
  const path = `${url.pathname}${url.search}`;
  return apiClient.get(path, { auth: false });
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
