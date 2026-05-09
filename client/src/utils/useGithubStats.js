// src/utils/useGithubStats.js
import { useEffect, useState } from "react";

const REPO = "parthnarkar/FitMart";
const API = `https://api.github.com/repos/${REPO}`;

// Used while loading and as a graceful fallback if the API is unreachable or rate-limited.
const FALLBACK_STATS = {
  stars: 105,
  forks: 144,
  contributors: 20,
  commits: 82,
};

// GitHub returns paginated lists with a Link header whose rel="last" page number equals the total count
// when ?per_page=1. This avoids fetching every page just to count items.
async function fetchPaginatedCount(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const link = res.headers.get("Link") || "";
  const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  if (match) return parseInt(match[1], 10);
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

export function useGithubStats() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [repoData, contributors, commits] = await Promise.all([
          fetch(API).then((r) => {
            if (!r.ok) throw new Error(`GitHub API ${r.status}`);
            return r.json();
          }),
          fetchPaginatedCount(`${API}/contributors?per_page=1&anon=1`),
          fetchPaginatedCount(`${API}/commits?per_page=1`),
        ]);

        if (cancelled) return;

        setStats({
          stars: repoData.stargazers_count ?? FALLBACK_STATS.stars,
          forks: repoData.forks_count ?? FALLBACK_STATS.forks,
          contributors,
          commits,
        });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}
