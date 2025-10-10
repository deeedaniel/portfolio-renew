export default async function handler(req, res) {
  try {
    // Step 1: refresh access token using your refresh token
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    if (!refreshToken)
      return res.status(400).json({
        error:
          "No SPOTIFY_REFRESH_TOKEN in env. Run /api/login to get one first.",
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

    // Step 2: Fetch top tracks from Spotify API
    const spRes = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!spRes.ok) {
      const text = await spRes.text();
      return res
        .status(spRes.status)
        .json({ error: "Spotify API error", details: text });
    }

    const data = await spRes.json();

    // Step 3: Simplify the track data
    const simplified = data.items.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      album_image: track.album.images[0]?.url,
      spotify_url: track.external_urls.spotify,
      preview_url: track.preview_url,
    }));

    // Step 4: Return top 5 tracks
    return res.status(200).json({ tracks: simplified });
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return res.status(500).json({ error: "Server error", details: error });
  }
}
