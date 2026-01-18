import { getValidAccessToken } from "./token-manager.js";
import {
  isRateLimited,
  getRateLimitInfo,
  handleRateLimitResponse,
} from "./rate-limit-manager.js";

// Cache variables for the now-playing data
let cachedNowPlaying = null;
let lastFetched = 0;

// Fetch preview URL from Spotify embed page (workaround for deprecated preview_url)
// Source - https://stackoverflow.com/a/79238027
// Posted by Diego Perez, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-18, License - CC BY-SA 4.0
async function fetchPreviewUrlFromEmbed(trackId) {
  if (!trackId) return null;

  try {
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
    const response = await fetch(embedUrl);

    if (!response.ok) {
      console.log(`Failed to fetch embed page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Look for the audioPreview URL in the HTML
    // It's typically embedded in a script tag with JSON data
    const regex = /"audioPreview":\s*{\s*"url":\s*"([^"]+)"/;
    const match = html.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    // Alternative pattern - sometimes it's nested differently
    const altRegex = /"audioPreview":\s*"([^"]+)"/;
    const altMatch = html.match(altRegex);

    if (altMatch && altMatch[1]) {
      return altMatch[1];
    }

    return null;
  } catch (error) {
    console.error("Error fetching preview URL from embed:", error);
    return null;
  }
}

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

    // Get preview URL - try API first, then fetch from embed page if not available
    let previewUrl = now.item?.preview_url;
    if (!previewUrl && now.item?.id) {
      console.log(
        `Preview URL not in API response, fetching from embed for track ${now.item.id}`
      );
      previewUrl = await fetchPreviewUrlFromEmbed(now.item.id);
    }

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
            preview_url: previewUrl,
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
