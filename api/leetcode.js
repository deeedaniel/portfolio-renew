let cachedStats = null;
let lastFetchTime = 0;

export default async function handler(req, res) {
  const CACHE_TTL = 1000 * 60 * 60; // 1 hour

  if (cachedStats && Date.now() - lastFetchTime < CACHE_TTL) {
    return res.status(200).json({ ...cachedStats, cached: true });
  }

  try {
    const response = await fetch(
      "https://leetcode-stats.tashif.codes/deeedaniel"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch LeCode stats: ${response.statusText}`);
    }

    const data = await response.json();

    const stats = {
      easySolved: data.easySolved,
      hardSolved: data.hardSolved,
      mediumSolved: data.mediumSolved,
      totalSolved: data.totalSolved,
      submissionCalendar: data.submissionCalendar,
    };

    cachedStats = stats;
    lastFetchTime = Date.now();

    res.status(200).json({ ...stats, cached: false });
  } catch (error) {
    console.error("Error fetching LeetCode stats:", error);

    if (cachedStats) {
      return res.status(200).json({
        ...cachedStats,
        cached: true,
        warning: "API error, showing cached data",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
