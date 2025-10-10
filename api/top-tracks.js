// /api/top-tracks.js

let cachedTracks = null;
let lastFetchTime = 0;

export default async function handler(req, res) {
  const CACHE_TTL = 1000 * 60 * 60; // 1 hour

  // Step 1: Serve from cache if recent
  if (cachedTracks && Date.now() - lastFetchTime < CACHE_TTL) {
    return res.status(200).json({ tracks: cachedTracks, cached: true });
  }

  // Step 2: Otherwise fetch fresh
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const tokenParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
      return res
        .status(500)
        .json({ error: "Failed to refresh access token", details: tokenData });

    const spRes = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    // if 429, return cached if we have one
    if (spRes.status === 429 && cachedTracks) {
      return res.status(200).json({
        tracks: cachedTracks,
        cached: true,
        warning: "Rate-limited, showing cached data",
      });
    }

    if (!spRes.ok) {
      const text = await spRes.text();
      return res
        .status(spRes.status)
        .json({ error: "Spotify API error", details: text });
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
  } catch (err) {
    if (cachedTracks) {
      return res.status(200).json({
        tracks: cachedTracks,
        cached: true,
        warning: "API failed, showing cached data",
      });
    }
    return res.status(500).json({ error: "Server error", details: err });
  }
}
