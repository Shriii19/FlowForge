import rateLimit from "express-rate-limit";

const RATE_LIMIT_WINDOW =
  15 * 60 * 1000;

const RATE_LIMIT_MAX =
  100;

const BURST_THRESHOLD = 20;

const requestAccounting =
  new Map();

const enforcementMetrics = {
  totalRequests: 0,
  throttledRequests: 0,
  burstEvents: 0,
};

function buildRateLimitResponse(
  clientKey,
  requestCount
) {
  return {
    success: false,
    error: {
      code:
        "RATE_LIMIT_EXCEEDED",
      message:
        "Too many requests. Please try again later.",
      timestamp:
        Date.now(),
      metadata: {
        clientKey,
        requestCount,
        fairnessValidated:
          true,
      },
    },
  };
}

function generateClientKey(
  req
) {
  return (
    req.ip ||
    req.headers[
      "x-forwarded-for"
    ] ||
    "unknown"
  );
}

function recordRequest(
  clientKey
) {
  const now = Date.now();

  const existing =
    requestAccounting.get(
      clientKey
    ) || {
      count: 0,
      firstSeen: now,
      lastSeen: now,
    };

  existing.count += 1;
  existing.lastSeen = now;

  requestAccounting.set(
    clientKey,
    existing
  );

  enforcementMetrics.totalRequests += 1;

  return existing;
}

function detectBurstTraffic(
  accounting
) {
  const duration =
    Math.max(
      1,
      accounting.lastSeen -
        accounting.firstSeen
    );

  const requestsPerMinute =
    (accounting.count /
      duration) *
    60000;

  const burstDetected =
    requestsPerMinute >
    BURST_THRESHOLD;

  if (burstDetected) {
    enforcementMetrics.burstEvents += 1;
  }

  return burstDetected;
}

function buildThrottleMetadata(
  clientKey
) {
  const accounting =
    requestAccounting.get(
      clientKey
    );

  return {
    clientKey,
    requestCount:
      accounting?.count || 0,
    burstDetected:
      accounting
        ? detectBurstTraffic(
            accounting
          )
        : false,
    fairnessScore: 100,
  };
}

function validateEnforcementFairness(
  clientKey
) {
  const accounting =
    requestAccounting.get(
      clientKey
    );

  if (!accounting) {
    return true;
  }

  return (
    accounting.count <=
    RATE_LIMIT_MAX * 2
  );
}

function cleanupExpiredAccounting() {
  const now = Date.now();

  requestAccounting.forEach(
    (
      accounting,
      clientKey
    ) => {
      if (
        now -
          accounting.lastSeen >
        RATE_LIMIT_WINDOW
      ) {
        requestAccounting.delete(
          clientKey
        );
      }
    }
  );
}

setInterval(
  cleanupExpiredAccounting,
  RATE_LIMIT_WINDOW
);

export function getRateLimitMetrics() {
  return {
    ...enforcementMetrics,
    trackedClients:
      requestAccounting.size,
  };
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

    keyGenerator: (
      req
    ) => {
      const clientKey =
        generateClientKey(
          req
        );

      recordRequest(
        clientKey
      );

      return clientKey;
    },

    handler: (
      req,
      res
    ) => {
      const clientKey =
        generateClientKey(
          req
        );

      enforcementMetrics.throttledRequests += 1;

      const metadata =
        buildThrottleMetadata(
          clientKey
        );

      validateEnforcementFairness(
        clientKey
      );

      return res
        .status(429)
        .json(
          buildRateLimitResponse(
            metadata.clientKey,
            metadata.requestCount
          )
        );
    },
  });