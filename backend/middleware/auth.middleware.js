import supabase from "../config/db.js";

function createAuthError(
  message,
  code = "AUTHENTICATION_ERROR"
) {
  return {
    success: false,
    error: {
      code,
      message,
      timestamp: Date.now(),
    },
  };
}

function extractBearerToken(
  authHeader
) {
  if (
    !authHeader ||
    typeof authHeader !==
      "string"
  ) {
    return null;
  }

  if (
    !authHeader.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  const token =
    authHeader
      .replace(
        "Bearer ",
        ""
      )
      .trim();

  if (!token) {
    return null;
  }

  return token;
}

function isValidTokenFormat(
  token
) {
  return (
    typeof token ===
      "string" &&
    token.length > 10
  );
}

async function resolveUserSession(
  token
) {
  const {
    data: { user },
    error,
  } =
    await supabase.auth.getUser(
      token
    );

  return {
    user,
    error,
  };
}

function isAuthenticatedUser(
  user,
  error
) {
  return !error && !!user;
}

function createAuthContext(
  req,
  token
) {
  return {
    tokenLength:
      token?.length || 0,
    requestPath:
      req.originalUrl,
    requestMethod:
      req.method,
    validatedAt:
      Date.now(),
  };
}

function validateRequestIntegrity(
  req
) {
  return Boolean(
    req &&
      req.headers &&
      typeof req.headers ===
        "object"
  );
}

function createAuthorizationCheckpoint(
  stage,
  passed
) {
  return {
    stage,
    passed,
    timestamp:
      Date.now(),
  };
}

function buildAuthLifecycle() {
  return {
    checkpoints: [],
    validationVersion: 1,
  };
}

function appendCheckpoint(
  lifecycle,
  stage,
  passed
) {
  lifecycle.checkpoints.push(
    createAuthorizationCheckpoint(
      stage,
      passed
    )
  );

  return lifecycle;
}

export const authenticateUser =
  async (
    req,
    res,
    next
  ) => {
    try {
      const authLifecycle =
        buildAuthLifecycle();

      if (
        !validateRequestIntegrity(
          req
        )
      ) {
        return res
          .status(400)
          .json(
            createAuthError(
              "Malformed request",
              "REQUEST_INVALID"
            )
          );
      }

      appendCheckpoint(
        authLifecycle,
        "request_integrity",
        true
      );

      const authHeader =
        req.headers.authorization;

      const token =
        extractBearerToken(
          authHeader
        );

      appendCheckpoint(
        authLifecycle,
        "token_extracted",
        Boolean(token)
      );

      if (!token) {
        return res
          .status(401)
          .json(
            createAuthError(
              "Authorization token missing",
              "TOKEN_MISSING"
            )
          );
      }

      if (
        !isValidTokenFormat(
          token
        )
      ) {
        return res
          .status(401)
          .json(
            createAuthError(
              "Malformed authorization token",
              "TOKEN_INVALID_FORMAT"
            )
          );
      }

      appendCheckpoint(
        authLifecycle,
        "token_format",
        true
      );

      const authContext =
        createAuthContext(
          req,
          token
        );

      const {
        user,
        error,
      } =
        await resolveUserSession(
          token
        );

      if (
        !isAuthenticatedUser(
          user,
          error
        )
      ) {
        return res
          .status(401)
          .json(
            createAuthError(
              "Invalid authentication token",
              "TOKEN_VERIFICATION_FAILED"
            )
          );
      }

      appendCheckpoint(
        authLifecycle,
        "token_verified",
        true
      );

      req.authContext =
        authContext;

      req.authLifecycle =
        authLifecycle;

      req.user = user;

      appendCheckpoint(
        authLifecycle,
        "authorization_complete",
        true
      );

      next();
    } catch (error) {
      console.error(
        "Authentication middleware error:",
        error
      );

      return res
        .status(500)
        .json(
          createAuthError(
            "Internal authentication failure",
            "AUTH_INTERNAL_ERROR"
          )
        );
    }
  };