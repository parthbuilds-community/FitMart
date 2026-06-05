import { useInfiniteQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "../utils/getAuthHeaders";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function fetchTransactions({ pageParam = null, queryKey }) {
  const [_key, { userId }] = queryKey;
  const headers = await getAuthHeaders();
  const url = new URL(`${API}/api/rewards/${userId}`);
  if (pageParam) url.searchParams.set("cursor", pageParam);
  url.searchParams.set("limit", "20");
  const res = await fetch(url.toString(), { headers, credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export default function useInfiniteTransactions(userId) {
  return useInfiniteQuery({
    queryKey: ["rewards-transactions", { userId }],
    queryFn: fetchTransactions,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.hasMore) return undefined;
      return lastPage.pagination.nextCursor;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
}
