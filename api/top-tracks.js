import { getValidAccessToken } from "./token-manager.js";
import {
  isRateLimited,
  getRateLimitInfo,
  handleRateLimitResponse,
} from "./rate-limit-manager.js";

let cachedTracks = null;
let lastFetchTime = 0;

export default async function handler(req, res) {
  const CACHE_TTL = 1000 * 60 * 1440; // 1 day since this is top tracks

  // Step 1: Serve from cache if recent
  if (cachedTracks && Date.now() - lastFetchTime < CACHE_TTL) {
    return res.status(200).json({ tracks: cachedTracks, cached: true });
  }

  // Step 2: Check if we're rate limited before making any requests
  if (isRateLimited()) {
    const rateLimitInfo = getRateLimitInfo();

    // If we have cached data, serve it with rate limit info
    if (cachedTracks) {
      return res.status(200).json({
        tracks: cachedTracks,
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

    const spRes = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // Handle rate limit response
    const rateLimitResult = handleRateLimitResponse(spRes);
    if (rateLimitResult.isRateLimited) {
      // Rate limit detected, serve cached data if available
      if (cachedTracks) {
        return res.status(200).json({
          tracks: cachedTracks,
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

    if (!spRes.ok) {
      const text = await spRes.text();

      // Fallback to cache on error
      if (cachedTracks) {
        return res.status(200).json({
          tracks: cachedTracks,
          cached: true,
          warning: "Spotify API error, showing cached data",
        });
      }

      return res.status(spRes.status).json({
        error: "Spotify API error",
        details: text,
      });
    }

    const data = await spRes.json();

    const simplified = data.items.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      album_image: track.album.images[0]?.url,
      spotify_url: track.external_urls.spotify,
    }));

    // Step 3: Save to cache
    cachedTracks = simplified;
    lastFetchTime = Date.now();

    return res.status(200).json({ tracks: simplified, cached: false });
  } catch (error) {
    console.error("Error in top-tracks API:", error);

    if (cachedTracks) {
      return res.status(200).json({
        tracks: cachedTracks,
        cached: true,
        warning: "API failed, showing cached data",
      });
    }

    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
