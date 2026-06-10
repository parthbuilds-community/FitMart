import { useInfiniteQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '../utils/getAuthHeaders';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function fetchCustomers({ pageParam = 1, queryKey }) {
  const [_key, params] = queryKey;
  const url = new URL(`${API}/api/customers`);
  url.searchParams.set('page', pageParam);
  url.searchParams.set('limit', params.limit || 24);

  // Admin-only endpoint — attach the Firebase (or dev) auth headers.
  const headers = await getAuthHeaders();
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to load customers');
  return json;
}

export default function useInfiniteCustomers(params = { limit: 24 }) {
  return useInfiniteQuery({
    queryKey: ['customers', params],
    queryFn: fetchCustomers,
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
