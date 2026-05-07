// src/utils/githubStats.js

export const fetchGithubStats = async () => {
  try {
    const [repoRes, contributorsRes, commitsRes] = await Promise.all([
      fetch("https://api.github.com/repos/parthnarkar/FitMart"),
      fetch("https://api.github.com/repos/parthnarkar/FitMart/contributors?per_page=1&anon=true"),
      fetch("https://api.github.com/repos/parthnarkar/FitMart/commits?per_page=1")
    ]);

    if (!repoRes.ok) throw new Error("Failed to fetch repo stats");

    const repoData = await repoRes.json();
    
    // Parse Link header to get total counts
    const getCountFromLink = (res, defaultValue) => {
      const link = res.headers.get("link");
      if (!link) return defaultValue;
      const match = link.match(/page=(\d+)>; rel="last"/);
      return match ? match[1] : defaultValue;
    };

    const contributorsCount = getCountFromLink(contributorsRes, "20");
    const commitsCount = getCountFromLink(commitsRes, "82");

    return {
      stars: repoData.stargazers_count?.toString() || "105",
      forks: repoData.forks_count?.toString() || "144",
      contributors: contributorsCount,
      commits: commitsCount + "+",
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return {
      stars: "105",
      forks: "144",
      contributors: "20",
      commits: "82+",
    };
  }
};
