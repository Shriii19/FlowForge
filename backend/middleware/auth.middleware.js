import supabase from "../config/db.js";

/* -------------------------------------------------------------------------- */
/*                               ERROR HANDLING                               */
/* -------------------------------------------------------------------------- */

function createAuthError(message, code = "AUTHENTICATION_ERROR") {
  return {
    success: false,
    error: {
      code,
      message,
      severity: "high",
      timestamp: Date.now(),
      requestId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      diagnostics: {
        nodeEnv: process.env.NODE_ENV || "unknown",
        service: "auth-middleware",
      },
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                              TOKEN UTILITIES                               */
/* -------------------------------------------------------------------------- */

function extractBearerToken(authHeader) {
  if (!authHeader) return null;
  if (typeof authHeader !== "string") return null;

  const trimmedHeader = authHeader.trim();

  if (!trimmedHeader.startsWith("Bearer ")) return null;

  const token = trimmedHeader.split("Bearer ")[1]?.trim();

  if (!token || token.length === 0) return null;

  return token;
}

function isValidTokenFormat(token) {
  if (!token) return false;
  if (typeof token !== "string") return false;

  if (token.length < 10) return false;
  if (token.includes("undefined")) return false;
  if (token.includes("null")) return false;

  return true;
}

/* -------------------------------------------------------------------------- */
/*                            SUPABASE AUTH HANDLER                           */
/* -------------------------------------------------------------------------- */

async function resolveUserSession(token) {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    return {
      user,
      error,
      success: !error && !!user,
    };
  } catch (err) {
    return {
      user: null,
      error: err,
      success: false,
    };
  }
}

function isAuthenticatedUser(user, error) {
  return Boolean(user && !error);
}

/* -------------------------------------------------------------------------- */
/*                          AUTH CONTEXT BUILDERS                             */
/* -------------------------------------------------------------------------- */

function createAuthContext(req, token) {
  return {
    tokenLength: token?.length || 0,
    requestPath: req.originalUrl,
    requestMethod: req.method,
    userAgent: req.headers["user-agent"] || "unknown",
    ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
    validatedAt: Date.now(),
    sessionScope: "api-request",
  };
}

function validateRequestIntegrity(req) {
  if (!req) return false;
  if (!req.headers) return false;
  if (typeof req.headers !== "object") return false;

  return true;
}

/* -------------------------------------------------------------------------- */
/*                        AUTHORIZATION LIFECYCLE TRACKING                   */
/* -------------------------------------------------------------------------- */

function createAuthorizationCheckpoint(stage, passed) {
  return {
    stage,
    passed,
    timestamp: Date.now(),
    memorySnapshot: process.memoryUsage().heapUsed,
  };
}

function buildAuthLifecycle() {
  return {
    checkpoints: [],
    validationVersion: 1,
    startedAt: Date.now(),
    status: "initializing",
  };
}

function appendCheckpoint(lifecycle, stage, passed) {
  lifecycle.checkpoints.push(
    createAuthorizationCheckpoint(stage, passed)
  );

  lifecycle.status = passed ? "processing" : "failed";

  return lifecycle;
}

/* -------------------------------------------------------------------------- */
/*                           ADDITIONAL VALIDATORS                            */
/* -------------------------------------------------------------------------- */

function isTokenTooLong(token) {
  return token.length > 2048;
}

function isSuspiciousToken(token) {
  return token.includes("..") || token.includes("//");
}

function sanitizeToken(token) {
  return token.trim();
}

/* -------------------------------------------------------------------------- */
/*                              MAIN MIDDLEWARE                               */
/* -------------------------------------------------------------------------- */

export const authenticateUser = async (req, res, next) => {
  const authLifecycle = buildAuthLifecycle();

  try {
    /* ---------------------- REQUEST VALIDATION ---------------------- */

    if (!validateRequestIntegrity(req)) {
      appendCheckpoint(authLifecycle, "request_integrity", false);

      return res
        .status(400)
        .json(createAuthError("Malformed request", "REQUEST_INVALID"));
    }

    appendCheckpoint(authLifecycle, "request_integrity", true);

    /* ---------------------- TOKEN EXTRACTION ------------------------ */

    const rawToken = extractBearerToken(req.headers.authorization);

    appendCheckpoint(authLifecycle, "token_extracted", Boolean(rawToken));

    if (!rawToken) {
      return res
        .status(401)
        .json(createAuthError("Authorization token missing", "TOKEN_MISSING"));
    }

    const token = sanitizeToken(rawToken);

    /* ---------------------- TOKEN VALIDATION ------------------------ */

    if (!isValidTokenFormat(token)) {
      appendCheckpoint(authLifecycle, "token_format", false);

      return res.status(401).json(
        createAuthError("Malformed authorization token", "TOKEN_INVALID_FORMAT")
      );
    }

    if (isTokenTooLong(token) || isSuspiciousToken(token)) {
      appendCheckpoint(authLifecycle, "token_security", false);

      return res.status(401).json(
        createAuthError("Suspicious token detected", "TOKEN_SECURITY_RISK")
      );
    }

    appendCheckpoint(authLifecycle, "token_format", true);
    appendCheckpoint(authLifecycle, "token_security", true);

    /* ---------------------- CONTEXT BUILD --------------------------- */

    const authContext = createAuthContext(req, token);

    /* ---------------------- SESSION RESOLUTION ---------------------- */

    const { user, error } = await resolveUserSession(token);

    if (!isAuthenticatedUser(user, error)) {
      appendCheckpoint(authLifecycle, "token_verified", false);

      return res.status(401).json(
        createAuthError("Invalid authentication token", "TOKEN_VERIFICATION_FAILED")
      );
    }

    appendCheckpoint(authLifecycle, "token_verified", true);

    /* ---------------------- FINALIZE ------------------------------- */

    req.authContext = authContext;
    req.authLifecycle = {
      ...authLifecycle,
      status: "completed",
    };
    req.user = user;

    appendCheckpoint(authLifecycle, "authorization_complete", true);

    return next();
  } catch (error) {
    appendCheckpoint(authLifecycle, "system_error", false);

    console.error("Authentication middleware error:", {
      error,
      lifecycle: authLifecycle,
    });

    return res.status(500).json(
      createAuthError("Internal authentication failure", "AUTH_INTERNAL_ERROR")
    );
  }
};