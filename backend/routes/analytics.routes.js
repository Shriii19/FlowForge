import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

function buildAnalyticsRequestContext(
  req
) {
  return {
    route: req.originalUrl,
    method: req.method,
    requestedAt:
      new Date().toISOString(),
    userId:
      req.user?.id ?? null,
    requestId:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
  };
}

function validateAnalyticsRequest(
  context
) {
  return Boolean(
    context.route &&
      context.method
  );
}

function trackRouteMetrics(
  context,
  status
) {
  return {
    requestId:
      context.requestId,
    route:
      context.route,
    status,
    processedAt:
      new Date().toISOString(),
  };
}

async function orchestrateAnalyticsRequest(
  req,
  res,
  handler
) {
  const context =
    buildAnalyticsRequestContext(
      req
    );

  if (
    !validateAnalyticsRequest(
      context
    )
  ) {
    return res
      .status(400)
      .json({
        error:
          "Invalid analytics request",
      });
  }

  req.analyticsContext =
    context;

  try {
    await handler(req, res);

    req.routeMetrics =
      trackRouteMetrics(
        context,
        "success"
      );
  } catch (error) {
    req.routeMetrics =
      trackRouteMetrics(
        context,
        "failed"
      );

    throw error;
  }
}

router.use(authenticateUser);

router.use(
  (req, _res, next) => {
    req.routeObservability = {
      route:
        req.originalUrl,
      startedAt:
        Date.now(),
    };

    next();
  }
);

router.get(
  "/",
  async (req, res, next) => {
    try {
      await orchestrateAnalyticsRequest(
        req,
        res,
        getAnalytics
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;