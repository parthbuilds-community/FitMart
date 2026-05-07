// src/utils/useGithubStats.js
import { useEffect, useState } from "react";

const REPO = "parthnarkar/FitMart";
const API = `https://api.github.com/repos/${REPO}`;
const CACHE_KEY = "fitmart_github_stats_v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — keeps us well under the 60 req/hr unauthenticated limit

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

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // sessionStorage unavailable (e.g. private mode) — silently skip caching
  }
}

export function useGithubStats() {
  const [stats, setStats] = useState(() => readCache() || FALLBACK_STATS);
  const [loading, setLoading] = useState(() => !readCache());
  const [error, setError] = useState(false);

  useEffect(() => {
    if (readCache()) return;

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

        const next = {
          stars: repoData.stargazers_count ?? FALLBACK_STATS.stars,
          forks: repoData.forks_count ?? FALLBACK_STATS.forks,
          contributors,
          commits,
        };
        setStats(next);
        writeCache(next);
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
