import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/", getAnalytics);

export default router;