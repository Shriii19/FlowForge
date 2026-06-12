import rateLimit from "express-rate-limit";

const RATE_LIMIT_WINDOW =
  15 * 60 * 1000;

const RATE_LIMIT_MAX =
  100;

function buildRateLimitResponse() {
  return {
    success: false,
    error: {
      code:
        "RATE_LIMIT_EXCEEDED",
      message:
        "Too many requests. Please try again later.",
      timestamp:
        Date.now(),
    },
  };
}

function generateClientKey(req) {
  return (
    req.ip ||
    req.headers[
      "x-forwarded-for"
    ] ||
    "unknown"
  );
}

export const apiLimiter =
  rateLimit({
    windowMs:
      RATE_LIMIT_WINDOW,

    max: RATE_LIMIT_MAX,

    standardHeaders: true,

    legacyHeaders: false,

    skipSuccessfulRequests:
      false,

    keyGenerator:
      generateClientKey,

    handler: (
      req,
      res
    ) => {
      return res
        .status(429)
        .json(
          buildRateLimitResponse()
        );
    },
  });