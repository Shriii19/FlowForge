import supabase from "../config/db.js";

function extractBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
}

async function resolveUserSession(token) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

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

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = extractBearerToken(authHeader);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const {
      user,
      error,
    } = await resolveUserSession(token);

    if (
      !isAuthenticatedUser(
        user,
        error
      )
    ) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};