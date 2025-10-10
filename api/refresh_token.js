export default async function handler(req, res) {
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!refreshToken)
    return res
      .status(400)
      .json({ error: "SPOTIFY_REFRESH_TOKEN not set in env" });

  const params = new URLSearchParams({
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
    body: params.toString(),
  });

  const tokenData = await tokenRes.json();
  // tokenData.access_token, tokenData.expires_in ...
  return res.status(200).json(tokenData);
}
