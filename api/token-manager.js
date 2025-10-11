// Shared token management for Spotify API
let cachedAccessToken = null;
let tokenExpiresAt = 0;

export async function getValidAccessToken() {
  // Check if we have a valid cached token
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  // Token expired or doesn't exist, refresh it
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error("SPOTIFY_REFRESH_TOKEN not set in environment variables");
  }

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

  if (!tokenData.access_token) {
    throw new Error(
      `Failed to refresh access token: ${JSON.stringify(tokenData)}`
    );
  }

  // Cache the new token with expiration (subtract 5 minutes for safety buffer)
  cachedAccessToken = tokenData.access_token;
  const expiresInMs = (tokenData.expires_in - 300) * 1000; // 5 min buffer
  tokenExpiresAt = Date.now() + expiresInMs;

  console.log(
    `New Spotify token cached, expires in ${tokenData.expires_in} seconds`
  );

  return cachedAccessToken;
}
