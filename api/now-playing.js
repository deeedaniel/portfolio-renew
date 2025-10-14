import { getValidAccessToken } from "./token-manager.js";
import {
  isRateLimited,
  getRateLimitInfo,
  handleRateLimitResponse,
} from "./rate-limit-manager.js";

// Cache variables for the now-playing data
let cachedNowPlaying = null;
let lastFetched = 0;

export default async function handler(req, res) {
  const CACHE_TTL = 1000 * 60 * 1; // 5 minutes

  // Step 1: Serve cached data if it's still fresh
  const isCacheValid = cachedNowPlaying && Date.now() - lastFetched < CACHE_TTL;
  if (isCacheValid) {
    return res.status(200).json({
      ...cachedNowPlaying,
      cached: true,
    });
  }

  // Step 2: Check if we're rate limited before making any requests
  if (isRateLimited()) {
    const rateLimitInfo = getRateLimitInfo();

    // If we have cached data, serve it with rate limit info
    if (cachedNowPlaying) {
      return res.status(200).json({
        ...cachedNowPlaying,
        cached: true,
        warning: `Rate limited. Retry after ${rateLimitInfo.remainingSeconds} seconds.`,
        rateLimitInfo,
      });
    }

    // No cached data available
    return res.status(429).json({
      error: "Rate limited",
      message: `Please wait ${rateLimitInfo.remainingSeconds} seconds before retrying`,
      retryAfter: rateLimitInfo.remainingSeconds,
    });
  }

  try {
    // Step 3: Get valid access token (will refresh if needed)
    const accessToken = await getValidAccessToken();

    // Step 4: Fetch currently playing track
    const spRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // Step 5: Handle rate limit response
    const rateLimitResult = handleRateLimitResponse(spRes);
    if (rateLimitResult.isRateLimited) {
      // Rate limit detected, serve cached data if available
      if (cachedNowPlaying) {
        return res.status(200).json({
          ...cachedNowPlaying,
          cached: true,
          warning: rateLimitResult.message,
          rateLimitInfo: {
            retryAfter: rateLimitResult.retryAfterSeconds,
          },
        });
      }

      return res.status(429).json({
        error: "Spotify rate limit exceeded",
        message: rateLimitResult.message,
        retryAfter: rateLimitResult.retryAfterSeconds,
      });
    }

    if (spRes.status === 204) {
      const emptyData = { is_playing: false, item: null };
      cachedNowPlaying = emptyData;
      lastFetched = Date.now();
      return res.status(200).json(emptyData);
    }

    if (!spRes.ok) {
      const text = await spRes.text();
      // fallback to cache if Spotify fails
      if (cachedNowPlaying) {
        return res.status(200).json({
          ...cachedNowPlaying,
          cached: true,
          warning: "Spotify API error, showing cached data",
        });
      }
      return res.status(spRes.status).json({
        error: "Spotify API error",
        details: text,
      });
    }

    // Step 5: Parse successful response
    const now = await spRes.json();
    const simplified = {
      is_playing: now.is_playing,
      progress_ms: now.progress_ms,
      item: now.item
        ? {
            id: now.item.id,
            name: now.item.name,
            artists: now.item.artists.map((a) => a.name),
            album: now.item.album?.name,
            album_image: now.item.album?.images?.[0]?.url,
            spotify_url: now.item.external_urls?.spotify,
          }
        : null,
    };

    // Step 6: Cache successful response
    cachedNowPlaying = simplified;
    lastFetched = Date.now();

    return res.status(200).json({ ...simplified, cached: false });
  } catch (error) {
    console.error("Error in now-playing API:", error);

    // Fallback to cached data if available
    if (cachedNowPlaying) {
      return res.status(200).json({
        ...cachedNowPlaying,
        cached: true,
        warning: "API error, showing cached data",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
