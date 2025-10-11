// Rate limit management for Spotify API
let rateLimitedUntil = 0;
let rateLimitRetryAfter = 0;

export function isRateLimited() {
  return Date.now() < rateLimitedUntil;
}

export function getRateLimitInfo() {
  if (!isRateLimited()) {
    return { isLimited: false };
  }

  const remainingMs = rateLimitedUntil - Date.now();
  return {
    isLimited: true,
    remainingMs,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    retryAfter: rateLimitRetryAfter,
  };
}

export function setRateLimit(retryAfterSeconds) {
  const retryAfterMs = retryAfterSeconds * 1000;
  rateLimitedUntil = Date.now() + retryAfterMs;
  rateLimitRetryAfter = retryAfterSeconds;

  console.log(
    `Rate limited for ${retryAfterSeconds} seconds until ${new Date(
      rateLimitedUntil
    ).toISOString()}`
  );
}

export function clearRateLimit() {
  rateLimitedUntil = 0;
  rateLimitRetryAfter = 0;
  console.log("Rate limit cleared");
}

export function handleRateLimitResponse(response) {
  if (response.status === 429) {
    // Get retry-after from headers (in seconds)
    const retryAfter = response.headers.get("retry-after");
    const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60; // Default to 60 seconds if not provided

    setRateLimit(retryAfterSeconds);
    return {
      isRateLimited: true,
      retryAfterSeconds,
      message: `Rate limited. Retry after ${retryAfterSeconds} seconds.`,
    };
  }

  // If we get a successful response, clear any existing rate limit
  if (response.ok) {
    clearRateLimit();
  }

  return { isRateLimited: false };
}
