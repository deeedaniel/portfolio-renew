export default async function handler(req, res) {
  // Step 1: get a fresh access token using server-side refresh token
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!refreshToken)
    return res
      .status(400)
      .json({
        error:
          "No SPOTIFY_REFRESH_TOKEN in env. Run /api/login and copy refresh token to Vercel env.",
      });

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

  // Step 2: call Spotify endpoint
  const spRes = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }
  );

  if (spRes.status === 204)
    return res.status(200).json({ is_playing: false, item: null });
  if (!spRes.ok) {
    const text = await spRes.text();
    return res
      .status(spRes.status)
      .json({ error: "Spotify API error", details: text });
  }

  const now = await spRes.json();
  // Extract what you want and return
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
  return res.status(200).json(simplified);
}
