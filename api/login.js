export default function handler(req, res) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state",
  ].join(" ");
  const state = Math.random().toString(36).slice(2);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  // Redirect the user to Spotify's authorization page
  res.writeHead(302, {
    Location: `https://accounts.spotify.com/authorize?${params.toString()}`,
  });
  res.end();
}
