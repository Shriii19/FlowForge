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

export const authenticateUser =
  async (
    req,
    res,
    next
  ) => {
    try {
      const authHeader =
        req.headers.authorization;

      const token =
        extractBearerToken(
          authHeader
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

      req.user = user;

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