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
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};