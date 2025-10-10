export default async function handler(req, res) {
  const code = req.query.code || null;
  if (!code) return res.status(400).send("Missing code");

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
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

  // tokenData contains: access_token, refresh_token, expires_in, token_type
  // For a personal portfolio, copy the refresh_token now and store it in Vercel env vars.
  // Return a tiny HTML page instructing the user to copy the refresh token.
  return res.status(200).send(`
      <html>
        <body style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
          <h2>Spotify tokens received</h2>
          <p><strong>Copy this <code>refresh_token</code> and add it to your Vercel project's environment variables as <code>SPOTIFY_REFRESH_TOKEN</code>.</strong></p>
          <pre style="background:#f6f8fa;padding:8px;border-radius:6px;">${tokenData.refresh_token}</pre>
          <p>After you set the env var, redeploy your Vercel project and then you can use <code>/api/now-playing</code>.</p>
        </body>
      </html>
    `);
}
