const express = require("express");
const router = express.Router();

// Repository to proxy stats for
const REPO = "parthbuilds-community/FitMart";
const API = `https://api.github.com/repos/${REPO}`;

// Optional: set GITHUB_TOKEN in server env to increase rate limits
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function makeHeaders() {
  const headers = { "User-Agent": "FitMart-Server" };
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`;
  return headers;
}

const FALLBACK_STATS = { stars: 145, forks: 222, contributors: 30, commits: 152 };

// Simple in-memory cache to avoid repeated GitHub hits
let cache = { stats: null, ts: 0 };
const TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchPaginatedCount(url) {
  try {
    const res = await fetch(url, { headers: makeHeaders() });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      const err = new Error(`GitHub API ${res.status}: ${txt}`);
      err.status = res.status;
      throw err;
    }
    const link = res.headers.get("link") || "";
    const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (match) return parseInt(match[1], 10);
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (e) {
    console.error("fetchPaginatedCount error:", e.message);
    return null;
  }
}

router.get("/stats", async (req, res) => {
  // Serve from cache when fresh
  const now = Date.now();
  if (cache.stats && now - cache.ts < TTL_MS) {
    return res.json({ stats: cache.stats, cached: true });
  }

  try {
    const repoFetch = await fetch(API, { headers: makeHeaders() });

    if (!repoFetch.ok) {
      const body = await repoFetch.text().catch(() => "");
      const status = repoFetch.status;
      console.error(`/api/github/stats error: GitHub API ${status} ${body}`);

      // On 403/429, return cached or fallback to avoid failing the client
      if (status === 403 || status === 429) {
        if (cache.stats) return res.json({ stats: cache.stats, cached: true });
        return res.json({ stats: FALLBACK_STATS, cached: false });
      }

      // For other non-OK statuses, throw to hit generic error handler below
      throw new Error(`GitHub API ${status}`);
    }

    const repoRes = await repoFetch.json();

    // Fetch counts; each may return null on error — fall back to zeros
    const [contributors, commits] = await Promise.all([
      fetchPaginatedCount(`${API}/contributors?per_page=1&anon=1`),
      fetchPaginatedCount(`${API}/commits?per_page=1`),
    ]);

    const stats = {
      stars: repoRes.stargazers_count ?? FALLBACK_STATS.stars,
      forks: repoRes.forks_count ?? FALLBACK_STATS.forks,
      contributors: contributors ?? FALLBACK_STATS.contributors,
      commits: commits ?? FALLBACK_STATS.commits,
    };

    // update cache
    cache = { stats, ts: Date.now() };

    res.json({ stats });
  } catch (err) {
    console.error("/api/github/stats error:", err.message);
    // Return cached or fallback instead of 502 where possible
    if (cache.stats) return res.json({ stats: cache.stats, cached: true });
    return res.json({ stats: FALLBACK_STATS, cached: false });
  }
});

module.exports = router;
